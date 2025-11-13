/**
 * Enterprise API Key Management System
 * Implements token bucket algorithm with automatic rotation and health monitoring
 */

interface APIKeyMetadata {
  key: string;
  lastUsed: number;
  count: number;
  rpm: number;           // Requests per minute
  rph: number;           // Requests per hour
  rpd: number;           // Requests per day
  hourlyCount: number;
  dailyCount: number;
  errorCount: number;
  successCount: number;
  avgLatency: number;
  isHealthy: boolean;
  circuitBreakerOpen: boolean;
  lastError?: string;
  lastErrorTime?: number;
}

interface QuotaAlert {
  level: 'warning' | 'critical';
  percentage: number;
  message: string;
  timestamp: number;
}

export class APIKeyManager {
  private keys: Map<string, APIKeyMetadata>;
  private quotaAlerts: QuotaAlert[] = [];
  private circuitBreakerThreshold = 5; // Number of consecutive errors before opening circuit
  private circuitBreakerResetTime = 60000; // 1 minute

  constructor(
    apiKeys: string | string[],
    requestsPerMinute: number = 50,
    requestsPerHour: number = 1000,
    requestsPerDay: number = 10000
  ) {
    this.keys = new Map();
    const keyArray = Array.isArray(apiKeys) ? apiKeys : [apiKeys];

    keyArray.forEach(key => {
      this.keys.set(key, {
        key,
        lastUsed: 0,
        count: 0,
        rpm: requestsPerMinute,
        rph: requestsPerHour,
        rpd: requestsPerDay,
        hourlyCount: 0,
        dailyCount: 0,
        errorCount: 0,
        successCount: 0,
        avgLatency: 0,
        isHealthy: true,
        circuitBreakerOpen: false,
      });
    });

    // Start background cleanup and monitoring
    this.startBackgroundMonitoring();
  }

  /**
   * Get an available API key using intelligent load balancing
   */
  public async getAvailableKey(): Promise<string | null> {
    const now = Date.now();

    // Filter healthy keys with open circuit breakers
    const healthyKeys = Array.from(this.keys.entries())
      .filter(([_, metadata]) => {
        // Check if circuit breaker should be reset
        if (metadata.circuitBreakerOpen) {
          if (now - (metadata.lastErrorTime || 0) > this.circuitBreakerResetTime) {
            metadata.circuitBreakerOpen = false;
            metadata.errorCount = 0;
            console.log(`[APIKeyManager] Circuit breaker reset for key: ${this.maskKey(metadata.key)}`);
          } else {
            return false; // Skip keys with open circuit breaker
          }
        }
        return metadata.isHealthy && !metadata.circuitBreakerOpen;
      });

    if (healthyKeys.length === 0) {
      console.error('[APIKeyManager] No healthy API keys available!');
      return null;
    }

    // Find key with lowest current usage (load balancing)
    let selectedKey: string | null = null;
    let lowestUsage = Infinity;

    for (const [key, metadata] of healthyKeys) {
      // Reset minute counter
      if (now - metadata.lastUsed > 60000) {
        metadata.count = 0;
      }

      // Reset hourly counter
      if (now - metadata.lastUsed > 3600000) {
        metadata.hourlyCount = 0;
      }

      // Reset daily counter
      if (now - metadata.lastUsed > 86400000) {
        metadata.dailyCount = 0;
      }

      // Check all rate limits
      if (
        metadata.count < metadata.rpm &&
        metadata.hourlyCount < metadata.rph &&
        metadata.dailyCount < metadata.rpd
      ) {
        const currentUsage =
          (metadata.count / metadata.rpm) * 0.5 +
          (metadata.hourlyCount / metadata.rph) * 0.3 +
          (metadata.dailyCount / metadata.rpd) * 0.2;

        if (currentUsage < lowestUsage) {
          lowestUsage = currentUsage;
          selectedKey = key;
        }
      }
    }

    if (!selectedKey) {
      console.warn('[APIKeyManager] All API keys at capacity');
      this.checkQuotaAlerts();
      return null;
    }

    // Update usage metrics
    const metadata = this.keys.get(selectedKey)!;
    metadata.count++;
    metadata.hourlyCount++;
    metadata.dailyCount++;
    metadata.lastUsed = now;

    // Check for quota warnings
    this.checkQuotaAlerts();

    return selectedKey;
  }

  /**
   * Record successful API call
   */
  public recordSuccess(key: string, latency: number): void {
    const metadata = this.keys.get(key);
    if (!metadata) return;

    metadata.successCount++;
    metadata.errorCount = 0; // Reset error count on success

    // Update average latency (exponential moving average)
    metadata.avgLatency = metadata.avgLatency === 0
      ? latency
      : metadata.avgLatency * 0.9 + latency * 0.1;

    // Close circuit breaker on successful request
    if (metadata.circuitBreakerOpen) {
      metadata.circuitBreakerOpen = false;
      console.log(`[APIKeyManager] Circuit breaker closed for key: ${this.maskKey(key)}`);
    }
  }

  /**
   * Record failed API call and implement circuit breaker
   */
  public recordError(key: string, error: string): void {
    const metadata = this.keys.get(key);
    if (!metadata) return;

    metadata.errorCount++;
    metadata.lastError = error;
    metadata.lastErrorTime = Date.now();

    // Open circuit breaker if error threshold exceeded
    if (metadata.errorCount >= this.circuitBreakerThreshold) {
      metadata.circuitBreakerOpen = true;
      metadata.isHealthy = false;
      console.error(
        `[APIKeyManager] Circuit breaker OPEN for key: ${this.maskKey(key)} ` +
        `(${metadata.errorCount} consecutive errors)`
      );
    }

    console.error(
      `[APIKeyManager] Error recorded for key: ${this.maskKey(key)} ` +
      `(${metadata.errorCount}/${this.circuitBreakerThreshold}) - ${error}`
    );
  }

  /**
   * Get key performance metrics
   */
  public getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    this.keys.forEach((metadata, key) => {
      const maskedKey = this.maskKey(key);
      metrics[maskedKey] = {
        requestsPerMinute: metadata.count,
        requestsPerHour: metadata.hourlyCount,
        requestsPerDay: metadata.dailyCount,
        totalSuccess: metadata.successCount,
        totalErrors: metadata.errorCount,
        avgLatency: Math.round(metadata.avgLatency),
        isHealthy: metadata.isHealthy,
        circuitBreakerOpen: metadata.circuitBreakerOpen,
        successRate: metadata.successCount > 0
          ? ((metadata.successCount / (metadata.successCount + metadata.errorCount)) * 100).toFixed(2) + '%'
          : 'N/A',
        utilizationRate: {
          minute: ((metadata.count / metadata.rpm) * 100).toFixed(1) + '%',
          hour: ((metadata.hourlyCount / metadata.rph) * 100).toFixed(1) + '%',
          day: ((metadata.dailyCount / metadata.rpd) * 100).toFixed(1) + '%',
        },
        lastError: metadata.lastError || 'None',
      };
    });

    return metrics;
  }

  /**
   * Get quota alerts
   */
  public getQuotaAlerts(): QuotaAlert[] {
    return this.quotaAlerts;
  }

  /**
   * Check for quota alerts at 70%, 85%, and 95%
   */
  private checkQuotaAlerts(): void {
    this.keys.forEach((metadata, key) => {
      const dailyUsagePercent = (metadata.dailyCount / metadata.rpd) * 100;
      const hourlyUsagePercent = (metadata.hourlyCount / metadata.rph) * 100;

      // Check daily quota
      if (dailyUsagePercent >= 95 && !this.hasRecentAlert(key, 95)) {
        this.addAlert('critical', 95, `API key ${this.maskKey(key)} at 95% daily quota`);
      } else if (dailyUsagePercent >= 85 && !this.hasRecentAlert(key, 85)) {
        this.addAlert('critical', 85, `API key ${this.maskKey(key)} at 85% daily quota`);
      } else if (dailyUsagePercent >= 70 && !this.hasRecentAlert(key, 70)) {
        this.addAlert('warning', 70, `API key ${this.maskKey(key)} at 70% daily quota`);
      }

      // Check hourly quota
      if (hourlyUsagePercent >= 95 && !this.hasRecentAlert(key, 95)) {
        this.addAlert('critical', 95, `API key ${this.maskKey(key)} at 95% hourly quota`);
      }
    });
  }

  private hasRecentAlert(key: string, percentage: number): boolean {
    const recentTime = Date.now() - 300000; // 5 minutes
    return this.quotaAlerts.some(
      alert => alert.message.includes(this.maskKey(key)) &&
               alert.percentage === percentage &&
               alert.timestamp > recentTime
    );
  }

  private addAlert(level: 'warning' | 'critical', percentage: number, message: string): void {
    this.quotaAlerts.push({
      level,
      percentage,
      message,
      timestamp: Date.now(),
    });

    // Keep only last 100 alerts
    if (this.quotaAlerts.length > 100) {
      this.quotaAlerts = this.quotaAlerts.slice(-100);
    }

    console.log(`[APIKeyManager] ${level.toUpperCase()}: ${message}`);
  }

  private maskKey(key: string): string {
    if (key.length <= 8) return '***';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  }

  /**
   * Background monitoring and cleanup
   */
  private startBackgroundMonitoring(): void {
    // Log metrics every 5 minutes
    setInterval(() => {
      const metrics = this.getMetrics();
      console.log('[APIKeyManager] Metrics:', JSON.stringify(metrics, null, 2));

      // Check alerts
      const alerts = this.getQuotaAlerts();
      const recentAlerts = alerts.filter(a => Date.now() - a.timestamp < 300000);
      if (recentAlerts.length > 0) {
        console.log('[APIKeyManager] Recent Alerts:', recentAlerts);
      }
    }, 300000); // 5 minutes
  }

  /**
   * Get total available capacity across all keys
   */
  public getTotalCapacity(): {
    availableRPM: number;
    availableRPH: number;
    availableRPD: number;
    totalRPM: number;
    totalRPH: number;
    totalRPD: number;
  } {
    let availableRPM = 0;
    let availableRPH = 0;
    let availableRPD = 0;
    let totalRPM = 0;
    let totalRPH = 0;
    let totalRPD = 0;

    this.keys.forEach((metadata) => {
      if (metadata.isHealthy && !metadata.circuitBreakerOpen) {
        availableRPM += metadata.rpm - metadata.count;
        availableRPH += metadata.rph - metadata.hourlyCount;
        availableRPD += metadata.rpd - metadata.dailyCount;
      }
      totalRPM += metadata.rpm;
      totalRPH += metadata.rph;
      totalRPD += metadata.rpd;
    });

    return {
      availableRPM: Math.max(0, availableRPM),
      availableRPH: Math.max(0, availableRPH),
      availableRPD: Math.max(0, availableRPD),
      totalRPM,
      totalRPH,
      totalRPD,
    };
  }
}

// Singleton instance
let apiKeyManager: APIKeyManager | null = null;

/**
 * Initialize the API Key Manager (call this once at startup)
 */
export function initAPIKeyManager(
  apiKeys: string | string[],
  rpm: number = 50,
  rph: number = 1000,
  rpd: number = 10000
): APIKeyManager {
  if (!apiKeyManager) {
    apiKeyManager = new APIKeyManager(apiKeys, rpm, rph, rpd);
    console.log('[APIKeyManager] Initialized with', Array.isArray(apiKeys) ? apiKeys.length : 1, 'key(s)');
  }
  return apiKeyManager;
}

/**
 * Get the singleton API Key Manager instance
 */
export function getAPIKeyManager(): APIKeyManager {
  if (!apiKeyManager) {
    // Initialize with env variable as fallback
    const keys = process.env.ANTHROPIC_API_KEYS
      ? process.env.ANTHROPIC_API_KEYS.split(',').map(k => k.trim())
      : [process.env.ANTHROPIC_API_KEY || ''];

    apiKeyManager = new APIKeyManager(keys);
  }
  return apiKeyManager;
}
