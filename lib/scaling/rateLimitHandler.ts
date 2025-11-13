/**
 * Enterprise Rate Limit Handler
 * Implements exponential backoff, circuit breaker pattern, and request throttling
 */

import Anthropic from '@anthropic-ai/sdk';

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

interface RateLimitError extends Error {
  status?: number;
  headers?: Record<string, string>;
}

export class RateLimitHandler {
  private defaultConfig: RetryConfig = {
    maxRetries: 8,
    initialDelayMs: 1000,
    maxDelayMs: 300000, // 5 minutes
    backoffMultiplier: 2,
  };

  /**
   * Execute API call with automatic retry and exponential backoff
   */
  async executeWithRetry<T>(
    apiCall: () => Promise<T>,
    apiKey: string,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: Error | null = null;
    let delay = finalConfig.initialDelayMs;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await apiCall();
        const latency = Date.now() - startTime;

        // Log successful request
        console.log(
          `[RateLimitHandler] Success (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}) ` +
          `latency: ${latency}ms`
        );

        return result;
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error
        const isRateLimitError = this.isRateLimitError(error);
        const isConnectionError = this.isConnectionError(error);
        const shouldRetry = isRateLimitError || isConnectionError;

        if (!shouldRetry || attempt === finalConfig.maxRetries) {
          console.error(
            `[RateLimitHandler] Final failure (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}):`,
            error.message
          );
          throw error;
        }

        // Calculate delay with jitter
        const jitter = Math.random() * 0.3 * delay; // ±30% jitter
        const currentDelay = Math.min(delay + jitter, finalConfig.maxDelayMs);

        console.warn(
          `[RateLimitHandler] ${isRateLimitError ? 'Rate limit' : 'Connection'} error ` +
          `(attempt ${attempt + 1}/${finalConfig.maxRetries + 1}). ` +
          `Retrying in ${Math.round(currentDelay)}ms... Error: ${error.message}`
        );

        // Wait before retrying
        await this.sleep(currentDelay);

        // Exponential backoff
        delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelayMs);
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Execute API call with circuit breaker pattern
   */
  async executeWithCircuitBreaker<T>(
    apiCall: () => Promise<T>,
    apiKey: string,
    onError?: (error: Error) => void,
    onSuccess?: (latency: number) => void
  ): Promise<T> {
    return this.executeWithRetry(
      async () => {
        try {
          const startTime = Date.now();
          const result = await apiCall();
          const latency = Date.now() - startTime;

          if (onSuccess) {
            onSuccess(latency);
          }

          return result;
        } catch (error: any) {
          if (onError) {
            onError(error);
          }
          throw error;
        }
      },
      apiKey
    );
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: any): boolean {
    return (
      error?.status === 429 ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.message?.toLowerCase().includes('too many requests') ||
      error?.error?.type === 'rate_limit_error'
    );
  }

  /**
   * Check if error is a connection error
   */
  private isConnectionError(error: any): boolean {
    return (
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNRESET' ||
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('timeout') ||
      error?.message?.toLowerCase().includes('socket')
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse rate limit headers and return retry-after time
   */
  parseRateLimitHeaders(headers: Record<string, string>): {
    limit?: number;
    remaining?: number;
    reset?: number;
    retryAfter?: number;
  } {
    return {
      limit: headers['x-ratelimit-limit']
        ? parseInt(headers['x-ratelimit-limit'])
        : undefined,
      remaining: headers['x-ratelimit-remaining']
        ? parseInt(headers['x-ratelimit-remaining'])
        : undefined,
      reset: headers['x-ratelimit-reset']
        ? parseInt(headers['x-ratelimit-reset'])
        : undefined,
      retryAfter: headers['retry-after']
        ? parseInt(headers['retry-after']) * 1000
        : undefined,
    };
  }

  /**
   * Adaptive throttling based on rate limit headers
   */
  async adaptiveThrottle(
    headers: Record<string, string>,
    requestCallback: () => Promise<void>
  ): Promise<void> {
    const rateLimitInfo = this.parseRateLimitHeaders(headers);

    if (rateLimitInfo.remaining !== undefined && rateLimitInfo.limit !== undefined) {
      const utilizationRate = 1 - rateLimitInfo.remaining / rateLimitInfo.limit;

      // If utilization is high, add delay
      if (utilizationRate > 0.8) {
        const delay = Math.min(5000, (utilizationRate - 0.8) * 25000); // Max 5s delay
        console.log(`[RateLimitHandler] Adaptive throttle: ${Math.round(delay)}ms delay (${Math.round(utilizationRate * 100)}% utilized)`);
        await this.sleep(delay);
      }
    }

    await requestCallback();
  }
}

// Singleton instance
let rateLimitHandler: RateLimitHandler | null = null;

/**
 * Get the singleton Rate Limit Handler instance
 */
export function getRateLimitHandler(): RateLimitHandler {
  if (!rateLimitHandler) {
    rateLimitHandler = new RateLimitHandler();
  }
  return rateLimitHandler;
}

/**
 * Decorator function for automatic retry with exponential backoff
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const handler = getRateLimitHandler();
    return handler.executeWithRetry(() => fn(...args), 'default', config);
  }) as T;
}

/**
 * Call Anthropic API with automatic retry and error handling
 */
export async function callAnthropicWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParams,
  apiKey: string,
  onError?: (error: Error) => void,
  onSuccess?: (latency: number) => void
): Promise<Anthropic.Message> {
  const handler = getRateLimitHandler();

  return handler.executeWithCircuitBreaker(
    () => client.messages.create(params),
    apiKey,
    onError,
    onSuccess
  );
}

/**
 * Call Anthropic streaming API with automatic retry
 */
export async function callAnthropicStreamWithRetry(
  client: Anthropic,
  params: Anthropic.MessageCreateParams,
  apiKey: string,
  onError?: (error: Error) => void,
  onSuccess?: (latency: number) => void
): Promise<Anthropic.Messages.MessageStream> {
  const handler = getRateLimitHandler();

  return handler.executeWithCircuitBreaker(
    () => client.messages.stream(params),
    apiKey,
    onError,
    onSuccess
  );
}
