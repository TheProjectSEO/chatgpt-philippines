/**
 * Retry handler with exponential backoff and circuit breaker pattern
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export class RetryHandler {
  private defaultConfig: RetryConfig = {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'],
  };

  /**
   * Execute function with retry logic and exponential backoff
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    let lastError: Error | null = null;
    let delay = mergedConfig.initialDelay;

    for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
      try {
        const result = await fn();
        if (attempt > 1) {
          console.log(`[RetryHandler] Succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error, mergedConfig);
        const isLastAttempt = attempt === mergedConfig.maxAttempts;

        if (!isRetryable || isLastAttempt) {
          console.error(
            `[RetryHandler] ${isRetryable ? 'Max attempts reached' : 'Non-retryable error'} after ${attempt} attempt(s):`,
            error.message
          );
          throw error;
        }

        // Log retry attempt
        console.warn(
          `[RetryHandler] Attempt ${attempt}/${mergedConfig.maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`
        );

        // Wait before retrying
        await this.sleep(delay);

        // Calculate next delay with exponential backoff
        delay = Math.min(delay * mergedConfig.backoffMultiplier, mergedConfig.maxDelay);

        // Add jitter to prevent thundering herd
        delay = delay + Math.random() * 1000;
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any, config: RetryConfig): boolean {
    // Network errors
    if (error.code && config.retryableErrors.includes(error.code)) {
      return true;
    }

    // Rate limit errors (429)
    if (error.status === 429 || error.statusCode === 429) {
      return true;
    }

    // Server errors (5xx)
    if (
      (error.status >= 500 && error.status < 600) ||
      (error.statusCode >= 500 && error.statusCode < 600)
    ) {
      return true;
    }

    // Timeout errors
    if (error.message && error.message.toLowerCase().includes('timeout')) {
      return true;
    }

    // Anthropic specific errors
    if (error.error?.type === 'overloaded_error') {
      return true;
    }

    return false;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute with rate limiting
   */
  async executeWithRateLimit<T>(
    fn: () => Promise<T>,
    requestsPerSecond: number
  ): Promise<T> {
    const delay = 1000 / requestsPerSecond;
    const result = await fn();
    await this.sleep(delay);
    return result;
  }
}

/**
 * Circuit breaker for failing services
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(
    failureThreshold: number = 5,
    successThreshold: number = 2,
    timeout: number = 60000
  ) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeout;
  }

  /**
   * Execute function through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        console.log('[CircuitBreaker] Transitioning to half-open state');
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        console.log('[CircuitBreaker] Closing circuit after successful recovery');
        this.state = 'closed';
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      console.error(
        `[CircuitBreaker] Opening circuit after ${this.failureCount} failures`
      );
      this.state = 'open';
    }
  }

  /**
   * Get current state
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

// Singleton instances
const retryHandler = new RetryHandler();
const circuitBreaker = new CircuitBreaker();

export { retryHandler, circuitBreaker };
