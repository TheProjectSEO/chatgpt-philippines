/**
 * Enterprise Worker Process Manager
 * Manages worker processes for queue job processing
 */

import { QueueManager, QueueJob, JobStatus } from './queueManager';

interface WorkerConfig {
  concurrency: number;
  pollInterval: number;
  healthCheckInterval: number;
  autoRestart: boolean;
  gracefulShutdown: boolean;
}

interface WorkerStats {
  id: string;
  status: 'idle' | 'busy' | 'stopped' | 'error';
  jobsProcessed: number;
  jobsFailed: number;
  currentJob?: string;
  uptime: number;
  lastError?: string;
}

export class WorkerManager<T = any, R = any> {
  private workers: Map<string, Worker<T, R>>;
  private config: WorkerConfig;
  private isRunning: boolean = false;

  constructor(
    private queue: QueueManager<T>,
    private processor: (data: T) => Promise<R>,
    config: Partial<WorkerConfig> = {}
  ) {
    this.workers = new Map();

    this.config = {
      concurrency: config.concurrency || 5,
      pollInterval: config.pollInterval || 1000,
      healthCheckInterval: config.healthCheckInterval || 30000,
      autoRestart: config.autoRestart !== false,
      gracefulShutdown: config.gracefulShutdown !== false,
    };

    console.log('[WorkerManager] Initialized with config:', this.config);
  }

  /**
   * Start all workers
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[WorkerManager] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[WorkerManager] Starting ${this.config.concurrency} workers...`);

    // Create workers
    for (let i = 0; i < this.config.concurrency; i++) {
      const worker = new Worker<T, R>(
        `worker-${i}`,
        this.queue,
        this.processor,
        this.config.pollInterval
      );

      this.workers.set(worker.id, worker);
      await worker.start();
    }

    // Start health check
    this.startHealthCheck();

    console.log(`[WorkerManager] ${this.workers.size} workers started`);
  }

  /**
   * Stop all workers
   */
  async stop(graceful: boolean = true): Promise<void> {
    if (!this.isRunning) return;

    console.log(`[WorkerManager] Stopping workers (graceful: ${graceful})...`);
    this.isRunning = false;

    const stopPromises = Array.from(this.workers.values()).map(worker =>
      worker.stop(graceful)
    );

    await Promise.all(stopPromises);
    this.workers.clear();

    console.log('[WorkerManager] All workers stopped');
  }

  /**
   * Get worker statistics
   */
  getStats(): WorkerStats[] {
    return Array.from(this.workers.values()).map(worker => worker.getStats());
  }

  /**
   * Get aggregate statistics
   */
  getAggregateStats(): {
    totalWorkers: number;
    activeWorkers: number;
    idleWorkers: number;
    totalProcessed: number;
    totalFailed: number;
    successRate: string;
  } {
    const stats = this.getStats();

    const totalProcessed = stats.reduce((sum, s) => sum + s.jobsProcessed, 0);
    const totalFailed = stats.reduce((sum, s) => sum + s.jobsFailed, 0);
    const total = totalProcessed + totalFailed;
    const successRate = total > 0
      ? ((totalProcessed / total) * 100).toFixed(2)
      : '0.00';

    return {
      totalWorkers: stats.length,
      activeWorkers: stats.filter(s => s.status === 'busy').length,
      idleWorkers: stats.filter(s => s.status === 'idle').length,
      totalProcessed,
      totalFailed,
      successRate: successRate + '%',
    };
  }

  /**
   * Restart a specific worker
   */
  async restartWorker(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    console.log(`[WorkerManager] Restarting worker ${workerId}...`);

    await worker.stop(true);
    await worker.start();

    console.log(`[WorkerManager] Worker ${workerId} restarted`);
  }

  /**
   * Scale workers up or down
   */
  async scale(targetConcurrency: number): Promise<void> {
    const currentConcurrency = this.workers.size;

    if (targetConcurrency === currentConcurrency) {
      return;
    }

    console.log(
      `[WorkerManager] Scaling from ${currentConcurrency} to ${targetConcurrency} workers`
    );

    if (targetConcurrency > currentConcurrency) {
      // Scale up
      const toAdd = targetConcurrency - currentConcurrency;
      for (let i = 0; i < toAdd; i++) {
        const workerId = `worker-${currentConcurrency + i}`;
        const worker = new Worker<T, R>(
          workerId,
          this.queue,
          this.processor,
          this.config.pollInterval
        );

        this.workers.set(workerId, worker);
        await worker.start();
      }
    } else {
      // Scale down
      const toRemove = currentConcurrency - targetConcurrency;
      const workersToStop = Array.from(this.workers.values()).slice(-toRemove);

      for (const worker of workersToStop) {
        await worker.stop(true);
        this.workers.delete(worker.id);
      }
    }

    this.config.concurrency = targetConcurrency;
    console.log(`[WorkerManager] Scaled to ${targetConcurrency} workers`);
  }

  /**
   * Health check and auto-recovery
   */
  private startHealthCheck(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      this.workers.forEach(async (worker) => {
        const stats = worker.getStats();

        // Restart workers in error state
        if (stats.status === 'error' && this.config.autoRestart) {
          console.error(
            `[WorkerManager] Worker ${worker.id} in error state, restarting...`
          );
          await this.restartWorker(worker.id);
        }

        // Check for stuck workers (processing same job for too long)
        if (
          stats.status === 'busy' &&
          stats.currentJob &&
          stats.uptime > 600000 // 10 minutes
        ) {
          console.warn(
            `[WorkerManager] Worker ${worker.id} appears stuck, restarting...`
          );
          await this.restartWorker(worker.id);
        }
      });

      // Log aggregate stats
      const aggStats = this.getAggregateStats();
      console.log('[WorkerManager] Stats:', aggStats);
    }, this.config.healthCheckInterval);
  }
}

/**
 * Individual Worker
 */
class Worker<T, R> {
  private isRunning: boolean = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private stats: {
    jobsProcessed: number;
    jobsFailed: number;
    startTime: number;
    currentJob?: string;
    lastError?: string;
  };
  private status: 'idle' | 'busy' | 'stopped' | 'error' = 'stopped';

  constructor(
    public readonly id: string,
    private queue: QueueManager<T>,
    private processor: (data: T) => Promise<R>,
    private pollInterval: number
  ) {
    this.stats = {
      jobsProcessed: 0,
      jobsFailed: 0,
      startTime: 0,
    };
  }

  /**
   * Start worker
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.status = 'idle';
    this.stats.startTime = Date.now();

    console.log(`[Worker ${this.id}] Started`);

    // Start polling for jobs
    this.poll();
  }

  /**
   * Stop worker
   */
  async stop(graceful: boolean = true): Promise<void> {
    if (!this.isRunning) return;

    console.log(`[Worker ${this.id}] Stopping (graceful: ${graceful})...`);

    this.isRunning = false;

    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }

    // Wait for current job to finish if graceful
    if (graceful && this.status === 'busy') {
      await this.waitForIdle();
    }

    this.status = 'stopped';
    console.log(`[Worker ${this.id}] Stopped`);
  }

  /**
   * Poll for jobs
   */
  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const job = await this.queue.dequeue();

      if (job) {
        await this.processJob(job);
      }
    } catch (error: any) {
      console.error(`[Worker ${this.id}] Poll error:`, error.message);
    }

    // Schedule next poll
    if (this.isRunning) {
      this.pollTimer = setTimeout(() => this.poll(), this.pollInterval);
    }
  }

  /**
   * Process a job
   */
  private async processJob(job: QueueJob<T>): Promise<void> {
    this.status = 'busy';
    this.stats.currentJob = job.id;

    console.log(`[Worker ${this.id}] Processing job ${job.id}...`);

    try {
      // Process the job
      const result = await this.processor(job.data);

      // Mark as completed
      await this.queue.complete(job.id, result);

      this.stats.jobsProcessed++;
      console.log(`[Worker ${this.id}] Completed job ${job.id}`);
    } catch (error: any) {
      console.error(`[Worker ${this.id}] Failed job ${job.id}:`, error.message);

      // Mark as failed
      await this.queue.fail(job.id, error.message);

      this.stats.jobsFailed++;
      this.stats.lastError = error.message;
      this.status = 'error';
    } finally {
      this.stats.currentJob = undefined;
      if (this.status !== 'error') {
        this.status = 'idle';
      }
    }
  }

  /**
   * Wait for worker to become idle
   */
  private async waitForIdle(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.status === 'idle' || this.status === 'stopped') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 30000);
    });
  }

  /**
   * Get worker statistics
   */
  getStats(): WorkerStats {
    return {
      id: this.id,
      status: this.status,
      jobsProcessed: this.stats.jobsProcessed,
      jobsFailed: this.stats.jobsFailed,
      currentJob: this.stats.currentJob,
      uptime: this.stats.startTime > 0 ? Date.now() - this.stats.startTime : 0,
      lastError: this.stats.lastError,
    };
  }
}

// Worker manager instances
const workerManagers: Map<string, WorkerManager<any, any>> = new Map();

/**
 * Get or create worker manager
 */
export function getWorkerManager<T = any, R = any>(
  name: string,
  queue: QueueManager<T>,
  processor: (data: T) => Promise<R>,
  config?: Partial<WorkerConfig>
): WorkerManager<T, R> {
  if (!workerManagers.has(name)) {
    const manager = new WorkerManager<T, R>(queue, processor, config);
    workerManagers.set(name, manager);
    console.log(`[WorkerManager] Created worker manager: ${name}`);
  }
  return workerManagers.get(name)!;
}

/**
 * Get all worker managers
 */
export function getAllWorkerManagers(): Map<string, WorkerManager<any, any>> {
  return workerManagers;
}
