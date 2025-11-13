/**
 * Queue-based architecture using Redis for request processing
 * Supports priority queues, dead letter queues, and worker management
 */

import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';

export interface QueueJob {
  id: string;
  priority: number;
  data: {
    messages: any[];
    model?: string;
    userId?: string;
    sessionId?: string;
  };
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
  averageProcessingTime: number;
}

export class QueueManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private readonly QUEUE_PREFIX = 'queue:chat';
  private readonly PRIORITY_QUEUE_PREFIX = 'queue:chat:priority';
  private readonly PROCESSING_QUEUE = 'queue:chat:processing';
  private readonly DLQ = 'queue:chat:dlq'; // Dead Letter Queue
  private readonly QUEUE_STATS = 'queue:chat:stats';

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const redisUrl =
        process.env.REDIS_URL ||
        process.env.REDIS_CONNECTION_STRING ||
        'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('[Queue] Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('[Queue] Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('[Queue] Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('[Queue] Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Add job to queue with priority
   * Priority: 0 (lowest) to 10 (highest)
   */
  async enqueue(
    data: QueueJob['data'],
    priority: number = 5,
    maxAttempts: number = 3
  ): Promise<string> {
    if (!this.isConnected || !this.client) {
      throw new Error('Queue not connected');
    }

    const jobId = uuidv4();
    const job: QueueJob = {
      id: jobId,
      priority,
      data,
      attempts: 0,
      maxAttempts,
      createdAt: Date.now(),
      status: 'pending',
    };

    try {
      // Store job details
      await this.client.set(`job:${jobId}`, JSON.stringify(job), {
        EX: 86400, // Expire after 24 hours
      });

      // Add to priority queue
      const queueKey = priority >= 7 ? this.PRIORITY_QUEUE_PREFIX : this.QUEUE_PREFIX;
      await this.client.rPush(queueKey, jobId);

      console.log(`[Queue] Job ${jobId} enqueued with priority ${priority}`);
      return jobId;
    } catch (error) {
      console.error('[Queue] Enqueue error:', error);
      throw error;
    }
  }

  /**
   * Dequeue next job (priority queue first, then regular queue)
   */
  async dequeue(timeout: number = 5): Promise<QueueJob | null> {
    if (!this.isConnected || !this.client) {
      throw new Error('Queue not connected');
    }

    try {
      // Try priority queue first
      let result = await this.client.blPop(this.PRIORITY_QUEUE_PREFIX, 0.1);

      // If no priority jobs, try regular queue
      if (!result) {
        result = await this.client.blPop(this.QUEUE_PREFIX, timeout);
      }

      if (!result) {
        return null;
      }

      const jobId = result.element;
      const jobData = await this.client.get(`job:${jobId}`);

      if (!jobData) {
        console.error(`[Queue] Job ${jobId} not found`);
        return null;
      }

      const job: QueueJob = JSON.parse(jobData);
      job.status = 'processing';
      job.startedAt = Date.now();
      job.attempts++;

      // Move to processing queue
      await this.client.rPush(this.PROCESSING_QUEUE, jobId);
      await this.client.set(`job:${jobId}`, JSON.stringify(job), {
        EX: 86400,
      });

      console.log(`[Queue] Job ${jobId} dequeued (attempt ${job.attempts}/${job.maxAttempts})`);
      return job;
    } catch (error) {
      console.error('[Queue] Dequeue error:', error);
      return null;
    }
  }

  /**
   * Mark job as completed
   */
  async complete(jobId: string, result?: any): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      const jobData = await this.client.get(`job:${jobId}`);
      if (!jobData) return;

      const job: QueueJob = JSON.parse(jobData);
      job.status = 'completed';
      job.completedAt = Date.now();

      await this.client.set(`job:${jobId}`, JSON.stringify(job), {
        EX: 3600, // Keep completed jobs for 1 hour
      });

      // Remove from processing queue
      await this.client.lRem(this.PROCESSING_QUEUE, 1, jobId);

      // Update stats
      const waitTime = (job.startedAt || Date.now()) - job.createdAt;
      const processingTime = Date.now() - (job.startedAt || Date.now());
      await this.updateStats('completed', waitTime, processingTime);

      console.log(`[Queue] Job ${jobId} completed`);
    } catch (error) {
      console.error('[Queue] Complete error:', error);
    }
  }

  /**
   * Mark job as failed and retry or move to DLQ
   */
  async fail(jobId: string, error: string): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      const jobData = await this.client.get(`job:${jobId}`);
      if (!jobData) return;

      const job: QueueJob = JSON.parse(jobData);
      job.error = error;

      // Remove from processing queue
      await this.client.lRem(this.PROCESSING_QUEUE, 1, jobId);

      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        job.status = 'pending';
        const backoffDelay = Math.min(Math.pow(2, job.attempts) * 1000, 30000);

        setTimeout(async () => {
          await this.client!.set(`job:${jobId}`, JSON.stringify(job), {
            EX: 86400,
          });
          await this.client!.rPush(this.QUEUE_PREFIX, jobId);
          console.log(`[Queue] Job ${jobId} retrying after ${backoffDelay}ms`);
        }, backoffDelay);
      } else {
        // Move to dead letter queue
        job.status = 'failed';
        await this.client.set(`job:${jobId}`, JSON.stringify(job), {
          EX: 604800, // Keep failed jobs for 7 days
        });
        await this.client.rPush(this.DLQ, jobId);
        await this.updateStats('failed', 0, 0);
        console.error(`[Queue] Job ${jobId} moved to DLQ after ${job.attempts} attempts`);
      }
    } catch (error) {
      console.error('[Queue] Fail error:', error);
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    if (!this.isConnected || !this.client) {
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        averageWaitTime: 0,
        averageProcessingTime: 0,
      };
    }

    try {
      const [pending, priorityPending, processing, failed, stats] = await Promise.all([
        this.client.lLen(this.QUEUE_PREFIX),
        this.client.lLen(this.PRIORITY_QUEUE_PREFIX),
        this.client.lLen(this.PROCESSING_QUEUE),
        this.client.lLen(this.DLQ),
        this.client.get(this.QUEUE_STATS),
      ]);

      const statsData = stats ? JSON.parse(stats) : {
        completed: 0,
        totalWaitTime: 0,
        totalProcessingTime: 0,
      };

      return {
        pending: pending + priorityPending,
        processing,
        completed: statsData.completed,
        failed,
        averageWaitTime: statsData.completed > 0
          ? Math.round(statsData.totalWaitTime / statsData.completed)
          : 0,
        averageProcessingTime: statsData.completed > 0
          ? Math.round(statsData.totalProcessingTime / statsData.completed)
          : 0,
      };
    } catch (error) {
      console.error('[Queue] GetStats error:', error);
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        averageWaitTime: 0,
        averageProcessingTime: 0,
      };
    }
  }

  /**
   * Update queue statistics
   */
  private async updateStats(
    type: 'completed' | 'failed',
    waitTime: number,
    processingTime: number
  ): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      const stats = await this.client.get(this.QUEUE_STATS);
      const statsData = stats ? JSON.parse(stats) : {
        completed: 0,
        failed: 0,
        totalWaitTime: 0,
        totalProcessingTime: 0,
      };

      if (type === 'completed') {
        statsData.completed++;
        statsData.totalWaitTime += waitTime;
        statsData.totalProcessingTime += processingTime;
      } else {
        statsData.failed++;
      }

      await this.client.set(this.QUEUE_STATS, JSON.stringify(statsData), {
        EX: 86400,
      });
    } catch (error) {
      console.error('[Queue] UpdateStats error:', error);
    }
  }

  /**
   * Get jobs from dead letter queue
   */
  async getDLQJobs(limit: number = 10): Promise<QueueJob[]> {
    if (!this.isConnected || !this.client) return [];

    try {
      const jobIds = await this.client.lRange(this.DLQ, 0, limit - 1);
      const jobs: QueueJob[] = [];

      for (const jobId of jobIds) {
        const jobData = await this.client.get(`job:${jobId}`);
        if (jobData) {
          jobs.push(JSON.parse(jobData));
        }
      }

      return jobs;
    } catch (error) {
      console.error('[Queue] GetDLQJobs error:', error);
      return [];
    }
  }

  /**
   * Retry a job from DLQ
   */
  async retryDLQJob(jobId: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const jobData = await this.client.get(`job:${jobId}`);
      if (!jobData) return false;

      const job: QueueJob = JSON.parse(jobData);
      job.status = 'pending';
      job.attempts = 0;
      job.error = undefined;

      await this.client.set(`job:${jobId}`, JSON.stringify(job), {
        EX: 86400,
      });
      await this.client.lRem(this.DLQ, 1, jobId);
      await this.client.rPush(this.QUEUE_PREFIX, jobId);

      console.log(`[Queue] Job ${jobId} retried from DLQ`);
      return true;
    } catch (error) {
      console.error('[Queue] RetryDLQJob error:', error);
      return false;
    }
  }

  /**
   * Clear all queues
   */
  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      await Promise.all([
        this.client.del(this.QUEUE_PREFIX),
        this.client.del(this.PRIORITY_QUEUE_PREFIX),
        this.client.del(this.PROCESSING_QUEUE),
        this.client.del(this.DLQ),
        this.client.del(this.QUEUE_STATS),
      ]);
      console.log('[Queue] All queues cleared');
    } catch (error) {
      console.error('[Queue] Clear error:', error);
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('[Queue] Disconnected from Redis');
    }
  }
}

// Singleton instance
let queueManagerInstance: QueueManager | null = null;

/**
 * Get the singleton queue manager instance
 */
export async function getQueueManager(): Promise<QueueManager> {
  if (!queueManagerInstance) {
    queueManagerInstance = new QueueManager();
    await queueManagerInstance.connect();
  }
  return queueManagerInstance;
}
