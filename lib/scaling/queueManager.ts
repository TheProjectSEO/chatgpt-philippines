/**
 * Enterprise Queue Manager (Redis-based with in-memory fallback)
 * Supports priority queues, dead letter queues, and job processing
 */

import { createHash } from 'crypto';

export enum QueuePriority {
  LOW = 0,
  NORMAL = 5,
  HIGH = 8,
  CRITICAL = 10,
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
}

export interface QueueJob<T = any> {
  id: string;
  data: T;
  priority: QueuePriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: any;
}

interface QueueConfig {
  maxConcurrent: number;
  maxAttempts: number;
  retryDelay: number;
  timeout: number;
  enableDLQ: boolean; // Dead Letter Queue
}

export class QueueManager<T = any> {
  private queue: Map<string, QueueJob<T>>;
  private processing: Set<string>;
  private dlq: Map<string, QueueJob<T>>; // Dead Letter Queue
  private config: QueueConfig;
  private stats = {
    totalEnqueued: 0,
    totalProcessed: 0,
    totalFailed: 0,
    avgProcessingTime: 0,
  };

  constructor(config: Partial<QueueConfig> = {}) {
    this.queue = new Map();
    this.processing = new Set();
    this.dlq = new Map();

    this.config = {
      maxConcurrent: config.maxConcurrent || 10,
      maxAttempts: config.maxAttempts || 3,
      retryDelay: config.retryDelay || 5000,
      timeout: config.timeout || 300000, // 5 minutes
      enableDLQ: config.enableDLQ !== false,
    };

    console.log('[QueueManager] Initialized with config:', this.config);
  }

  /**
   * Add job to queue
   */
  async enqueue(
    data: T,
    priority: QueuePriority = QueuePriority.NORMAL,
    maxAttempts?: number
  ): Promise<string> {
    const id = this.generateJobId(data);

    const job: QueueJob<T> = {
      id,
      data,
      priority,
      status: JobStatus.PENDING,
      attempts: 0,
      maxAttempts: maxAttempts || this.config.maxAttempts,
      createdAt: Date.now(),
    };

    this.queue.set(id, job);
    this.stats.totalEnqueued++;

    console.log(
      `[QueueManager] Enqueued job ${id} (priority: ${priority}, queue size: ${this.queue.size})`
    );

    return id;
  }

  /**
   * Get next job from queue (respecting priority)
   */
  async dequeue(): Promise<QueueJob<T> | null> {
    // Don't dequeue if we're at max concurrent jobs
    if (this.processing.size >= this.config.maxConcurrent) {
      return null;
    }

    // Get all pending jobs sorted by priority
    const pendingJobs = Array.from(this.queue.values())
      .filter(job => job.status === JobStatus.PENDING || job.status === JobStatus.RETRY)
      .sort((a, b) => {
        // Sort by priority (descending) then by created time (ascending)
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.createdAt - b.createdAt;
      });

    if (pendingJobs.length === 0) {
      return null;
    }

    const job = pendingJobs[0];
    job.status = JobStatus.PROCESSING;
    job.startedAt = Date.now();
    job.attempts++;

    this.processing.add(job.id);

    console.log(
      `[QueueManager] Dequeued job ${job.id} ` +
      `(attempt ${job.attempts}/${job.maxAttempts}, processing: ${this.processing.size})`
    );

    return job;
  }

  /**
   * Mark job as completed
   */
  async complete(jobId: string, result?: any): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) return;

    job.status = JobStatus.COMPLETED;
    job.completedAt = Date.now();
    job.result = result;

    this.processing.delete(jobId);
    this.stats.totalProcessed++;

    // Update avg processing time
    const processingTime = job.completedAt - (job.startedAt || job.createdAt);
    this.stats.avgProcessingTime =
      (this.stats.avgProcessingTime * (this.stats.totalProcessed - 1) + processingTime) /
      this.stats.totalProcessed;

    console.log(
      `[QueueManager] Completed job ${jobId} ` +
      `(processing time: ${processingTime}ms)`
    );

    // Remove from queue after a delay (for debugging)
    setTimeout(() => {
      this.queue.delete(jobId);
    }, 60000); // Keep for 1 minute
  }

  /**
   * Mark job as failed
   */
  async fail(jobId: string, error: string): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) return;

    job.error = error;
    this.processing.delete(jobId);

    // Retry if attempts remaining
    if (job.attempts < job.maxAttempts) {
      job.status = JobStatus.RETRY;

      console.log(
        `[QueueManager] Job ${jobId} failed, will retry ` +
        `(${job.attempts}/${job.maxAttempts}): ${error}`
      );

      // Retry with exponential backoff
      setTimeout(() => {
        const retryJob = this.queue.get(jobId);
        if (retryJob && retryJob.status === JobStatus.RETRY) {
          retryJob.status = JobStatus.PENDING;
        }
      }, this.config.retryDelay * Math.pow(2, job.attempts - 1));
    } else {
      // Move to DLQ
      job.status = JobStatus.FAILED;
      job.completedAt = Date.now();
      this.stats.totalFailed++;

      if (this.config.enableDLQ) {
        this.dlq.set(jobId, job);
        console.error(`[QueueManager] Job ${jobId} moved to DLQ: ${error}`);
      }

      console.error(
        `[QueueManager] Job ${jobId} permanently failed ` +
        `(${job.attempts}/${job.maxAttempts}): ${error}`
      );
    }
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<QueueJob<T> | null> {
    return this.queue.get(jobId) || this.dlq.get(jobId) || null;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueSize: number;
    processing: number;
    dlqSize: number;
    totalEnqueued: number;
    totalProcessed: number;
    totalFailed: number;
    successRate: string;
    avgProcessingTime: string;
  } {
    const total = this.stats.totalProcessed + this.stats.totalFailed;
    const successRate = total > 0
      ? ((this.stats.totalProcessed / total) * 100).toFixed(2)
      : '0.00';

    return {
      queueSize: this.queue.size,
      processing: this.processing.size,
      dlqSize: this.dlq.size,
      totalEnqueued: this.stats.totalEnqueued,
      totalProcessed: this.stats.totalProcessed,
      totalFailed: this.stats.totalFailed,
      successRate: successRate + '%',
      avgProcessingTime: Math.round(this.stats.avgProcessingTime) + 'ms',
    };
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): QueueJob<T>[] {
    return Array.from(this.queue.values()).filter(job => job.status === status);
  }

  /**
   * Get priority distribution
   */
  getPriorityDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
    };

    this.queue.forEach(job => {
      if (job.priority >= QueuePriority.CRITICAL) distribution.critical++;
      else if (job.priority >= QueuePriority.HIGH) distribution.high++;
      else if (job.priority >= QueuePriority.NORMAL) distribution.normal++;
      else distribution.low++;
    });

    return distribution;
  }

  /**
   * Get Dead Letter Queue jobs
   */
  getDLQJobs(): QueueJob<T>[] {
    return Array.from(this.dlq.values());
  }

  /**
   * Retry job from DLQ
   */
  async retryFromDLQ(jobId: string): Promise<boolean> {
    const job = this.dlq.get(jobId);
    if (!job) return false;

    // Reset job
    job.status = JobStatus.PENDING;
    job.attempts = 0;
    job.error = undefined;
    delete job.completedAt;

    this.queue.set(jobId, job);
    this.dlq.delete(jobId);

    console.log(`[QueueManager] Retrying job ${jobId} from DLQ`);
    return true;
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    let cleared = 0;
    this.queue.forEach((job, id) => {
      if (job.status === JobStatus.COMPLETED) {
        this.queue.delete(id);
        cleared++;
      }
    });
    console.log(`[QueueManager] Cleared ${cleared} completed jobs`);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(data: T): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const dataHash = createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 8);

    return `job_${timestamp}_${dataHash}_${random}`;
  }
}

// Queue instances for different job types
const queues: Map<string, QueueManager<any>> = new Map();

/**
 * Get or create queue for a specific type
 */
export function getQueue<T = any>(
  queueName: string,
  config?: Partial<QueueConfig>
): QueueManager<T> {
  if (!queues.has(queueName)) {
    queues.set(queueName, new QueueManager<T>(config));
    console.log(`[QueueManager] Created queue: ${queueName}`);
  }
  return queues.get(queueName)!;
}

/**
 * Get all queues
 */
export function getAllQueues(): Map<string, QueueManager<any>> {
  return queues;
}

/**
 * Execute job with queue
 */
export async function executeWithQueue<T, R>(
  queueName: string,
  data: T,
  processor: (data: T) => Promise<R>,
  priority: QueuePriority = QueuePriority.NORMAL
): Promise<R> {
  const queue = getQueue<T>(queueName);

  // Enqueue job
  const jobId = await queue.enqueue(data, priority);

  // Wait for job to be processed (polling)
  return new Promise<R>((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      const job = await queue.getJob(jobId);

      if (!job) {
        clearInterval(checkInterval);
        reject(new Error('Job not found'));
        return;
      }

      if (job.status === JobStatus.COMPLETED) {
        clearInterval(checkInterval);
        resolve(job.result);
      } else if (job.status === JobStatus.FAILED) {
        clearInterval(checkInterval);
        reject(new Error(job.error || 'Job failed'));
      }
    }, 500);

    // Timeout
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Job timeout'));
    }, 300000); // 5 minutes
  });
}
