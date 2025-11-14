/**
 * Simplified API Key Manager
 * Manages multiple Anthropic API keys with rotation, health monitoring, and basic circuit breaking
 */

interface KeyMetadata {
  key: string;
  lastUsed: number;
  requestCount: number;
  errorCount: number;
  lastError: number | null;
  status: 'healthy' | 'circuit_open';
}

interface CircuitBreakerConfig {
  errorThreshold: number; // Number of consecutive errors before opening circuit
  resetTimeout: number; // Time in ms before attempting to close circuit
}

export class APIKeyManager {
  private keys: Map<string, KeyMetadata> = new Map();
  private circuitBreaker: CircuitBreakerConfig = {
    errorThreshold: 5,
    resetTimeout: 60000, // 1 minute
  };
  private currentIndex: number = 0;

  constructor(apiKeys: string[]) {
    if (apiKeys.length === 0) {
      throw new Error('At least one API key is required');
    }

    apiKeys.forEach((key) => {
      this.keys.set(key, {
        key,
        lastUsed: 0,
        requestCount: 0,
        errorCount: 0,
        lastError: null,
        status: 'healthy',
      });
    });

    console.log(`[API Key Manager] Initialized with ${apiKeys.length} API key(s)`);
  }

  /**
   * Get next available API key using round-robin with circuit breaker
   * Falls back to least-used key if current key is circuit-broken
   */
  getAvailableKey(): { key: string; metadata: KeyMetadata } | null {
    const now = Date.now();
    const keyArray = Array.from(this.keys.entries());

    // Check and reset circuit breakers
    for (const [key, metadata] of keyArray) {
      if (
        metadata.status === 'circuit_open' &&
        metadata.lastError &&
        now - metadata.lastError > this.circuitBreaker.resetTimeout
      ) {
        metadata.status = 'healthy';
        metadata.errorCount = 0;
        console.log(`[API Key Manager] Circuit breaker reset for key ${this.maskKey(key)}`);
      }
    }

    // Filter healthy keys
    const healthyKeys = keyArray.filter(([_, meta]) => meta.status === 'healthy');

    if (healthyKeys.length === 0) {
      console.error('[API Key Manager] All API keys are circuit-broken');
      return null;
    }

    // Round-robin selection among healthy keys
    let selected = healthyKeys[this.currentIndex % healthyKeys.length];
    this.currentIndex = (this.currentIndex + 1) % healthyKeys.length;

    const [key, metadata] = selected;
    metadata.requestCount++;
    metadata.lastUsed = now;

    return { key, metadata };
  }

  /**
   * Report successful API call - reduces error count
   */
  reportSuccess(key: string): void {
    const metadata = this.keys.get(key);
    if (!metadata) return;

    // Gradually reduce error count on success
    if (metadata.errorCount > 0) {
      metadata.errorCount = Math.max(0, metadata.errorCount - 1);
    }

    // Recover from circuit break if errors cleared
    if (metadata.status === 'circuit_open' && metadata.errorCount === 0) {
      metadata.status = 'healthy';
      console.log(`[API Key Manager] Key ${this.maskKey(key)} recovered to healthy status`);
    }
  }

  /**
   * Report API call failure - implements circuit breaker
   */
  reportError(key: string, error: any): void {
    const metadata = this.keys.get(key);
    if (!metadata) return;

    metadata.errorCount++;
    metadata.lastError = Date.now();

    // Open circuit breaker if threshold exceeded
    if (metadata.errorCount >= this.circuitBreaker.errorThreshold) {
      metadata.status = 'circuit_open';
      console.error(
        `[API Key Manager] Circuit breaker OPENED for key ${this.maskKey(key)} after ${metadata.errorCount} errors`
      );
    }

    // Log specific error types
    if (error?.status === 429) {
      console.warn(`[API Key Manager] Rate limit hit for key ${this.maskKey(key)}`);
    } else if (error?.status >= 500) {
      console.error(`[API Key Manager] Server error for key ${this.maskKey(key)}: ${error.status}`);
    } else {
      console.error(`[API Key Manager] Error for key ${this.maskKey(key)}:`, error?.message || error);
    }
  }

  /**
   * Get health status of all keys
   */
  getHealthStatus(): {
    totalKeys: number;
    healthy: number;
    circuitOpen: number;
    keys: Array<{
      key: string;
      status: string;
      requestCount: number;
      errorCount: number;
      lastUsed: string;
    }>;
  } {
    const keys: Array<{
      key: string;
      status: string;
      requestCount: number;
      errorCount: number;
      lastUsed: string;
    }> = [];

    let healthy = 0;
    let circuitOpen = 0;

    for (const [key, metadata] of this.keys.entries()) {
      keys.push({
        key: this.maskKey(key),
        status: metadata.status,
        requestCount: metadata.requestCount,
        errorCount: metadata.errorCount,
        lastUsed: metadata.lastUsed
          ? new Date(metadata.lastUsed).toISOString()
          : 'Never',
      });

      if (metadata.status === 'healthy') healthy++;
      else if (metadata.status === 'circuit_open') circuitOpen++;
    }

    return {
      totalKeys: this.keys.size,
      healthy,
      circuitOpen,
      keys,
    };
  }

  /**
   * Get usage alerts
   */
  getUsageAlerts(): Array<{ level: 'warning' | 'critical'; message: string }> {
    const alerts: Array<{ level: 'warning' | 'critical'; message: string }> = [];

    for (const [key, metadata] of this.keys.entries()) {
      if (metadata.status === 'circuit_open') {
        alerts.push({
          level: 'critical',
          message: `Key ${this.maskKey(key)} is circuit-broken (${metadata.errorCount} errors)`,
        });
      } else if (metadata.errorCount >= 3) {
        alerts.push({
          level: 'warning',
          message: `Key ${this.maskKey(key)} has ${metadata.errorCount} errors (threshold: ${this.circuitBreaker.errorThreshold})`,
        });
      }
    }

    // Alert if no healthy keys
    const healthyCount = Array.from(this.keys.values()).filter(
      (m) => m.status === 'healthy'
    ).length;

    if (healthyCount === 0) {
      alerts.push({
        level: 'critical',
        message: 'All API keys are circuit-broken',
      });
    } else if (healthyCount === 1 && this.keys.size > 1) {
      alerts.push({
        level: 'warning',
        message: 'Only 1 healthy API key remaining',
      });
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
   * Reset all error counts (useful for testing or manual recovery)
   */
  resetErrorCounts(): void {
    for (const metadata of this.keys.values()) {
      metadata.errorCount = 0;
      metadata.status = 'healthy';
      metadata.lastError = null;
    }
    console.log('[API Key Manager] All error counts reset');
  }
}

// Singleton instance
let apiKeyManagerInstance: APIKeyManager | null = null;

/**
 * Initialize the API Key Manager from environment variables
 * Supports the following environment variable formats:
 * - ANTHROPIC_API_KEY (primary key)
 * - ANTHROPIC_API_KEY_2, ANTHROPIC_API_KEY_3, etc. (additional keys)
 */
export function initializeAPIKeyManager(): APIKeyManager {
  if (apiKeyManagerInstance) {
    return apiKeyManagerInstance;
  }

  const keys: string[] = [];

  // Primary key
  if (process.env.ANTHROPIC_API_KEY) {
    keys.push(process.env.ANTHROPIC_API_KEY);
  }

  // Additional keys: ANTHROPIC_API_KEY_2 through ANTHROPIC_API_KEY_10
  for (let i = 2; i <= 10; i++) {
    const key = process.env[`ANTHROPIC_API_KEY_${i}`];
    if (key) {
      keys.push(key);
    }
  }

  if (keys.length === 0) {
    throw new Error('No Anthropic API keys configured. Set ANTHROPIC_API_KEY in environment variables.');
  }

  apiKeyManagerInstance = new APIKeyManager(keys);

  return apiKeyManagerInstance;
}

/**
 * Get the singleton API Key Manager instance
 * Initializes if not already initialized
 */
export function getAPIKeyManager(): APIKeyManager {
  if (!apiKeyManagerInstance) {
    return initializeAPIKeyManager();
  }
  return apiKeyManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAPIKeyManager(): void {
  apiKeyManagerInstance = null;
}
