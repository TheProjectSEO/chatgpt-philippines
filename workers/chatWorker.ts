/**
 * Worker process for handling chat requests from queue
 * Can be run in multiple instances for horizontal scaling
 */

import Anthropic from '@anthropic-ai/sdk';
import { getQueueManager, QueueJob } from '../lib/queue';
import { getCacheManager } from '../lib/cache';
import { getAPIKeyManager } from '../lib/apiKeyManager';
import { retryHandler, circuitBreaker } from '../lib/retryHandler';
import { trackModelUsage } from '../lib/analytics';
import { estimateCost, getModelTypeFromString } from '../lib/modelSelection';

// Worker configuration
const WORKER_ID = process.env.WORKER_ID || `worker-${process.pid}`;
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

let isShuttingDown = false;
let activeJobs = 0;

/**
 * Process a single job from the queue
 */
async function processJob(job: QueueJob): Promise<void> {
  const queue = await getQueueManager();
  const cache = await getCacheManager();
  const apiKeyManager = getAPIKeyManager();

  activeJobs++;

  try {
    console.log(`[${WORKER_ID}] Processing job ${job.id}`);

    const { messages, model, userId } = job.data;

    // Generate cache key from messages
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const cacheKey = lastUserMessage?.content || '';

    // Check cache first
    const cached = await cache.get(cacheKey, model || 'claude-3-7-sonnet-20250219');
    if (cached) {
      console.log(`[${WORKER_ID}] Cache hit for job ${job.id}`);
      await queue.complete(job.id, cached.response);
      activeJobs--;
      return;
    }

    // Get available API key
    const keyData = apiKeyManager.getAvailableKey();
    if (!keyData) {
      throw new Error('No API keys available');
    }

    // Create Anthropic client with selected key
    const anthropic = new Anthropic({
      apiKey: keyData.key,
    });

    // Execute API call with retry logic and circuit breaker
    const result = await circuitBreaker.execute(async () => {
      return await retryHandler.executeWithRetry(async () => {
        const response = await anthropic.messages.create({
          model: model || 'claude-3-7-sonnet-20250219',
          max_tokens: 4096,
          temperature: 0.7,
          messages: messages,
        });

        return response;
      });
    });

    // Report success to API key manager
    apiKeyManager.reportSuccess(keyData.key);

    // Extract tokens and calculate cost
    const inputTokens = result.usage.input_tokens;
    const outputTokens = result.usage.output_tokens;
    const modelType = getModelTypeFromString(model || 'claude-3-7-sonnet-20250219');
    const cost = estimateCost(modelType, inputTokens, outputTokens);

    console.log(
      `[${WORKER_ID}] Job ${job.id} completed | Model: ${model} | Cost: $${cost.toFixed(6)} | Tokens: ${inputTokens}+${outputTokens}`
    );

    // Cache the response
    await cache.set(cacheKey, model || 'claude-3-7-sonnet-20250219', result, {
      input: inputTokens,
      output: outputTokens,
    });

    // Track usage analytics (fire and forget)
    trackModelUsage({
      user_id: userId || null,
      model: model || 'claude-3-7-sonnet-20250219',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: cost,
    }).catch((error) => {
      console.error(`[${WORKER_ID}] Analytics error:`, error);
    });

    // Mark job as complete
    await queue.complete(job.id, result);

    activeJobs--;
  } catch (error: any) {
    console.error(`[${WORKER_ID}] Job ${job.id} failed:`, error.message);

    // Report error to API key manager if it's an API error
    if (error.status || error.statusCode) {
      const keyData = apiKeyManager.getAvailableKey();
      if (keyData) {
        apiKeyManager.reportError(keyData.key, error);
      }
    }

    // Mark job as failed (will retry or move to DLQ)
    await queue.fail(job.id, error.message);

    activeJobs--;
  }
}

/**
 * Main worker loop
 */
async function runWorker(): Promise<void> {
  console.log(`[${WORKER_ID}] Starting worker with concurrency ${WORKER_CONCURRENCY}`);

  const queue = await getQueueManager();
  const promises: Promise<void>[] = [];

  while (!isShuttingDown) {
    try {
      // Maintain concurrency level
      while (promises.length < WORKER_CONCURRENCY && !isShuttingDown) {
        const job = await queue.dequeue(5);

        if (job) {
          const promise = processJob(job)
            .catch((error) => {
              console.error(`[${WORKER_ID}] Unexpected error processing job:`, error);
            })
            .finally(() => {
              // Remove completed promise
              const index = promises.indexOf(promise);
              if (index > -1) {
                promises.splice(index, 1);
              }
            });

          promises.push(promise);
        } else {
          // No jobs available, wait a bit
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Wait for at least one job to complete before checking for more
      if (promises.length > 0) {
        await Promise.race(promises);
      }
    } catch (error) {
      console.error(`[${WORKER_ID}] Worker loop error:`, error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Wait for active jobs to complete
  console.log(`[${WORKER_ID}] Waiting for ${activeJobs} active jobs to complete...`);
  await Promise.all(promises);
  console.log(`[${WORKER_ID}] All jobs completed, shutting down`);
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  console.log(`[${WORKER_ID}] Received ${signal}, starting graceful shutdown`);
  isShuttingDown = true;

  // Set timeout for forced shutdown
  const forceShutdown = setTimeout(() => {
    console.error(`[${WORKER_ID}] Shutdown timeout reached, forcing exit`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // Disconnect from services
    const queue = await getQueueManager();
    const cache = await getCacheManager();

    await Promise.all([
      queue.disconnect(),
      cache.disconnect(),
    ]);

    clearTimeout(forceShutdown);
    console.log(`[${WORKER_ID}] Shutdown complete`);
    process.exit(0);
  } catch (error) {
    console.error(`[${WORKER_ID}] Error during shutdown:`, error);
    clearTimeout(forceShutdown);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`[${WORKER_ID}] Uncaught exception:`, error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${WORKER_ID}] Unhandled rejection at:`, promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// Start the worker
if (require.main === module) {
  runWorker().catch((error) => {
    console.error(`[${WORKER_ID}] Fatal error:`, error);
    process.exit(1);
  });
}

export { runWorker, processJob };
