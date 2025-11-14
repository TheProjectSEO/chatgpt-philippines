/**
 * API Key Manager with Token Bucket Algorithm
 * Manages multiple Anthropic API keys with rotation, health monitoring, and rate limiting
 */

interface KeyMetadata {
  key: string;
  lastUsed: number;
  count: number;
  rpm: number; // Requests per minute
  dailyLimit: number;
  dailyCount: number;
  lastDailyReset: number;
  errorCount: number;
  lastError: number | null;
  status: 'healthy' | 'degraded' | 'circuit_open';
  priority: number; // Higher priority keys used first
}

interface CircuitBreakerConfig {
  errorThreshold: number; // Number of errors before opening circuit
  resetTimeout: number; // Time in ms before attempting to close circuit
  halfOpenAttempts: number; // Number of successful attempts needed to close circuit
}

export class APIKeyManager {
  private keys: Map<string, KeyMetadata> = new Map();
  private circuitBreaker: CircuitBreakerConfig = {
    errorThreshold: 5,
    resetTimeout: 60000, // 1 minute
    halfOpenAttempts: 3,
  };

  constructor(
    keysConfig: Array<{
      key: string;
      rpm?: number;
      dailyLimit?: number;
      priority?: number;
    }>
  ) {
    const now = Date.now();
    keysConfig.forEach((config) => {
      this.keys.set(config.key, {
        key: config.key,
        lastUsed: 0,
        count: 0,
        rpm: config.rpm || 50, // Default 50 RPM per key
        dailyLimit: config.dailyLimit || 50000, // Default 50k requests per day
        dailyCount: 0,
        lastDailyReset: now,
        errorCount: 0,
        lastError: null,
        status: 'healthy',
        priority: config.priority || 1,
      });
    });
  }

  /**
   * Get an available API key using token bucket algorithm
   * Returns null if all keys are at capacity
   */
  getAvailableKey(): { key: string; metadata: KeyMetadata } | null {
    const now = Date.now();
    const availableKeys: Array<{ key: string; metadata: KeyMetadata }> = [];

    // Reset counters and check circuit breakers
    for (const [key, metadata] of this.keys.entries()) {
      // Reset minute counter if a minute has passed
      if (now - metadata.lastUsed > 60000) {
        metadata.count = 0;
      }

      // Reset daily counter if a day has passed
      if (now - metadata.lastDailyReset > 86400000) {
        metadata.dailyCount = 0;
        metadata.lastDailyReset = now;
      }

      // Check if circuit breaker should be reset
      if (
        metadata.status === 'circuit_open' &&
        metadata.lastError &&
        now - metadata.lastError > this.circuitBreaker.resetTimeout
      ) {
        metadata.status = 'degraded';
        metadata.errorCount = 0;
      }

      // Check if key is available
      if (
        metadata.status !== 'circuit_open' &&
        metadata.count < metadata.rpm &&
        metadata.dailyCount < metadata.dailyLimit
      ) {
        availableKeys.push({ key, metadata });
      }
    }

    if (availableKeys.length === 0) {
      return null;
    }

    // Sort by priority (descending) then by usage (ascending)
    availableKeys.sort((a, b) => {
      if (a.metadata.priority !== b.metadata.priority) {
        return b.metadata.priority - a.metadata.priority;
      }
      return a.metadata.count - b.metadata.count;
    });

    const selected = availableKeys[0];
    selected.metadata.count++;
    selected.metadata.dailyCount++;
    selected.metadata.lastUsed = now;

    return selected;
  }

  /**
   * Report successful API call
   */
  reportSuccess(key: string): void {
    const metadata = this.keys.get(key);
    if (!metadata) return;

    // Reset error count on success
    if (metadata.errorCount > 0) {
      metadata.errorCount = Math.max(0, metadata.errorCount - 1);
    }

    // Upgrade status if recovering
    if (metadata.status === 'degraded' && metadata.errorCount === 0) {
      metadata.status = 'healthy';
    }
  }

  /**
   * Report API call failure and implement circuit breaker
   */
  reportError(key: string, error: any): void {
    const metadata = this.keys.get(key);
    if (!metadata) return;

    metadata.errorCount++;
    metadata.lastError = Date.now();

    // Degrade status based on error count
    if (metadata.errorCount >= this.circuitBreaker.errorThreshold) {
      metadata.status = 'circuit_open';
      console.error(
        `[API Key Manager] Circuit breaker opened for key ${this.maskKey(key)} after ${metadata.errorCount} errors`
      );
    } else if (metadata.errorCount >= 2) {
      metadata.status = 'degraded';
    }

    // Log specific error types
    if (error.status === 429) {
      console.warn(`[API Key Manager] Rate limit hit for key ${this.maskKey(key)}`);
    } else if (error.status >= 500) {
      console.error(`[API Key Manager] Server error for key ${this.maskKey(key)}: ${error.status}`);
    }
  }

  /**
   * Get health status of all keys
   */
  getHealthStatus(): {
    totalKeys: number;
    healthy: number;
    degraded: number;
    circuitOpen: number;
    usage: Array<{
      key: string;
      status: string;
      rpm: string;
      dailyUsage: string;
      errorCount: number;
    }>;
  } {
    const now = Date.now();
    const usage: Array<{
      key: string;
      status: string;
      rpm: string;
      dailyUsage: string;
      errorCount: number;
    }> = [];

    let healthy = 0;
    let degraded = 0;
    let circuitOpen = 0;

    for (const [key, metadata] of this.keys.entries()) {
      // Reset minute counter for accurate reporting
      if (now - metadata.lastUsed > 60000) {
        metadata.count = 0;
      }

      usage.push({
        key: this.maskKey(key),
        status: metadata.status,
        rpm: `${metadata.count}/${metadata.rpm}`,
        dailyUsage: `${metadata.dailyCount}/${metadata.dailyLimit}`,
        errorCount: metadata.errorCount,
      });

      if (metadata.status === 'healthy') healthy++;
      else if (metadata.status === 'degraded') degraded++;
      else if (metadata.status === 'circuit_open') circuitOpen++;
    }

    return {
      totalKeys: this.keys.size,
      healthy,
      degraded,
      circuitOpen,
      usage,
    };
  }

  /**
   * Get predictive usage alerts
   */
  getUsageAlerts(): Array<{ level: 'warning' | 'critical'; message: string }> {
    const alerts: Array<{ level: 'warning' | 'critical'; message: string }> = [];

    for (const [key, metadata] of this.keys.entries()) {
      const dailyPercentage = (metadata.dailyCount / metadata.dailyLimit) * 100;

      if (dailyPercentage >= 95) {
        alerts.push({
          level: 'critical',
          message: `Key ${this.maskKey(key)} at ${dailyPercentage.toFixed(1)}% of daily quota`,
        });
      } else if (dailyPercentage >= 85) {
        alerts.push({
          level: 'warning',
          message: `Key ${this.maskKey(key)} at ${dailyPercentage.toFixed(1)}% of daily quota`,
        });
      } else if (dailyPercentage >= 70) {
        alerts.push({
          level: 'warning',
          message: `Key ${this.maskKey(key)} at ${dailyPercentage.toFixed(1)}% of daily quota`,
        });
      }

      if (metadata.status !== 'healthy') {
        alerts.push({
          level: metadata.status === 'circuit_open' ? 'critical' : 'warning',
          message: `Key ${this.maskKey(key)} status: ${metadata.status}`,
        });
      }
    }

    return alerts;
  }

  /**
   * Mask API key for logging (show only first 8 and last 4 characters)
   */
  private maskKey(key: string): string {
    if (key.length < 12) return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Get total capacity across all keys
   */
  getTotalCapacity(): {
    currentRPM: number;
    maxRPM: number;
    currentDaily: number;
    maxDaily: number;
  } {
    let currentRPM = 0;
    let maxRPM = 0;
    let currentDaily = 0;
    let maxDaily = 0;

    for (const metadata of this.keys.values()) {
      currentRPM += metadata.count;
      maxRPM += metadata.rpm;
      currentDaily += metadata.dailyCount;
      maxDaily += metadata.dailyLimit;
    }

    return { currentRPM, maxRPM, currentDaily, maxDaily };
  }
}

// Singleton instance
let apiKeyManagerInstance: APIKeyManager | null = null;

/**
 * Initialize the API Key Manager with configuration
 */
export function initializeAPIKeyManager() {
  if (apiKeyManagerInstance) {
    return apiKeyManagerInstance;
  }

  // Parse API keys from environment variables
  const keys: Array<{ key: string; rpm?: number; dailyLimit?: number; priority?: number }> = [];

  // Primary key
  if (process.env.ANTHROPIC_API_KEY) {
    keys.push({
      key: process.env.ANTHROPIC_API_KEY,
      rpm: 50,
      dailyLimit: 50000,
      priority: 1,
    });
  }

  // Additional keys with format: ANTHROPIC_API_KEY_2, ANTHROPIC_API_KEY_3, etc.
  for (let i = 2; i <= 10; i++) {
    const key = process.env[`ANTHROPIC_API_KEY_${i}`];
    if (key) {
      keys.push({
        key,
        rpm: 50,
        dailyLimit: 50000,
        priority: 1,
      });
    }
  }

  // Fallback keys with lower priority
  for (let i = 1; i <= 5; i++) {
    const key = process.env[`ANTHROPIC_API_KEY_FALLBACK_${i}`];
    if (key) {
      keys.push({
        key,
        rpm: 30,
        dailyLimit: 30000,
        priority: 0, // Lower priority
      });
    }
  }

  if (keys.length === 0) {
    throw new Error('No Anthropic API keys configured');
  }

  apiKeyManagerInstance = new APIKeyManager(keys);
  console.log(`[API Key Manager] Initialized with ${keys.length} API key(s)`);

  return apiKeyManagerInstance;
}

/**
 * Get the singleton instance
 */
export function getAPIKeyManager(): APIKeyManager {
  if (!apiKeyManagerInstance) {
    return initializeAPIKeyManager();
  }
  return apiKeyManagerInstance;
}
