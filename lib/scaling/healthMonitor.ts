/**
 * Enterprise Health Monitoring System
 * Monitors system health, API quotas, and triggers alerts
 */

import { getAPIKeyManager } from './apiKeyManager';
import { getCacheManager } from './cacheManager';
import { getSemanticCache } from './semanticCache';
import { getAllQueues } from './queueManager';
import { getAllWorkerManagers } from './workerManager';
import { getMetricsCollector } from './metricsCollector';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
}

interface HealthCheck {
  component: string;
  status: HealthStatus;
  message: string;
  timestamp: number;
  details?: any;
}

interface SystemHealth {
  overall: HealthStatus;
  checks: HealthCheck[];
  timestamp: number;
  uptime: number;
}

export class HealthMonitor {
  private startTime: number;
  private healthChecks: Map<string, HealthCheck>;
  private alertThresholds = {
    apiQuota: 0.85, // Alert at 85% quota usage
    queueSize: 1000, // Alert if queue > 1000 jobs
    errorRate: 0.1, // Alert if error rate > 10%
    latency: 5000, // Alert if avg latency > 5s
  };

  constructor() {
    this.startTime = Date.now();
    this.healthChecks = new Map();

    console.log('[HealthMonitor] Initialized');

    // Start continuous monitoring
    this.startMonitoring();
  }

  /**
   * Perform comprehensive health check
   */
  async checkHealth(): Promise<SystemHealth> {
    const checks: HealthCheck[] = [];

    // Check API Key Manager
    try {
      const apiKeyManager = getAPIKeyManager();
      const capacity = apiKeyManager.getTotalCapacity();
      const metrics = apiKeyManager.getMetrics();

      const utilizationRPD =
        1 - capacity.availableRPD / capacity.totalRPD;

      let status = HealthStatus.HEALTHY;
      let message = 'API keys healthy';

      if (utilizationRPD > 0.95) {
        status = HealthStatus.CRITICAL;
        message = 'API quota critical (>95%)';
      } else if (utilizationRPD > 0.85) {
        status = HealthStatus.DEGRADED;
        message = 'API quota high (>85%)';
      }

      checks.push({
        component: 'api_keys',
        status,
        message,
        timestamp: Date.now(),
        details: {
          capacity,
          utilizationRPD: (utilizationRPD * 100).toFixed(1) + '%',
          healthyKeys: Object.values(metrics).filter((m: any) => m.isHealthy).length,
          totalKeys: Object.keys(metrics).length,
        },
      });
    } catch (error: any) {
      checks.push({
        component: 'api_keys',
        status: HealthStatus.UNHEALTHY,
        message: `API Key Manager error: ${error.message}`,
        timestamp: Date.now(),
      });
    }

    // Check Cache
    try {
      const cacheManager = getCacheManager();
      const stats = cacheManager.getStats();
      const hitRateNum = parseFloat(stats.hitRate);

      let status = HealthStatus.HEALTHY;
      let message = `Cache healthy (${stats.hitRate} hit rate)`;

      if (hitRateNum < 30) {
        status = HealthStatus.DEGRADED;
        message = `Cache hit rate low (${stats.hitRate})`;
      }

      checks.push({
        component: 'cache',
        status,
        message,
        timestamp: Date.now(),
        details: stats,
      });
    } catch (error: any) {
      checks.push({
        component: 'cache',
        status: HealthStatus.UNHEALTHY,
        message: `Cache error: ${error.message}`,
        timestamp: Date.now(),
      });
    }

    // Check Semantic Cache
    try {
      const semanticCache = getSemanticCache();
      const stats = semanticCache.getStats();

      checks.push({
        component: 'semantic_cache',
        status: HealthStatus.HEALTHY,
        message: `Semantic cache operational (${stats.hitRate} hit rate)`,
        timestamp: Date.now(),
        details: stats,
      });
    } catch (error: any) {
      checks.push({
        component: 'semantic_cache',
        status: HealthStatus.UNHEALTHY,
        message: `Semantic cache error: ${error.message}`,
        timestamp: Date.now(),
      });
    }

    // Check Queues
    try {
      const queues = getAllQueues();
      let totalQueueSize = 0;
      let maxQueueSize = 0;
      const queueStats: any = {};

      queues.forEach((queue, name) => {
        const stats = queue.getStats();
        queueStats[name] = stats;
        totalQueueSize += stats.queueSize;
        maxQueueSize = Math.max(maxQueueSize, stats.queueSize);
      });

      let status = HealthStatus.HEALTHY;
      let message = `Queues healthy (${totalQueueSize} total jobs)`;

      if (maxQueueSize > this.alertThresholds.queueSize * 2) {
        status = HealthStatus.CRITICAL;
        message = `Queue critically full (${maxQueueSize} jobs)`;
      } else if (maxQueueSize > this.alertThresholds.queueSize) {
        status = HealthStatus.DEGRADED;
        message = `Queue size high (${maxQueueSize} jobs)`;
      }

      checks.push({
        component: 'queues',
        status,
        message,
        timestamp: Date.now(),
        details: {
          totalQueues: queues.size,
          totalQueueSize,
          maxQueueSize,
          queueStats,
        },
      });
    } catch (error: any) {
      checks.push({
        component: 'queues',
        status: HealthStatus.UNHEALTHY,
        message: `Queue error: ${error.message}`,
        timestamp: Date.now(),
      });
    }

    // Check Workers
    try {
      const workerManagers = getAllWorkerManagers();
      let totalWorkers = 0;
      let activeWorkers = 0;
      let errorWorkers = 0;

      workerManagers.forEach((manager) => {
        const stats = manager.getStats();
        stats.forEach((workerStat) => {
          totalWorkers++;
          if (workerStat.status === 'busy') activeWorkers++;
          if (workerStat.status === 'error') errorWorkers++;
        });
      });

      let status = HealthStatus.HEALTHY;
      let message = `Workers healthy (${activeWorkers}/${totalWorkers} active)`;

      if (errorWorkers > totalWorkers * 0.3) {
        status = HealthStatus.CRITICAL;
        message = `Many workers in error state (${errorWorkers}/${totalWorkers})`;
      } else if (errorWorkers > 0) {
        status = HealthStatus.DEGRADED;
        message = `Some workers in error state (${errorWorkers}/${totalWorkers})`;
      }

      checks.push({
        component: 'workers',
        status,
        message,
        timestamp: Date.now(),
        details: {
          total: totalWorkers,
          active: activeWorkers,
          errors: errorWorkers,
        },
      });
    } catch (error: any) {
      checks.push({
        component: 'workers',
        status: HealthStatus.HEALTHY,
        message: 'Workers not initialized',
        timestamp: Date.now(),
      });
    }

    // Check Metrics
    try {
      const metricsCollector = getMetricsCollector();
      const metrics = metricsCollector.getMetricsJSON();
      const summary = metricsCollector.getSummary();

      checks.push({
        component: 'metrics',
        status: HealthStatus.HEALTHY,
        message: `Metrics collection active (${summary.totalCounters} counters)`,
        timestamp: Date.now(),
        details: summary,
      });
    } catch (error: any) {
      checks.push({
        component: 'metrics',
        status: HealthStatus.UNHEALTHY,
        message: `Metrics error: ${error.message}`,
        timestamp: Date.now(),
      });
    }

    // Determine overall health
    const overall = this.calculateOverallHealth(checks);

    // Store health checks
    checks.forEach((check) => {
      this.healthChecks.set(check.component, check);
    });

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallHealth(checks: HealthCheck[]): HealthStatus {
    const statuses = checks.map((c) => c.status);

    if (statuses.includes(HealthStatus.CRITICAL)) {
      return HealthStatus.CRITICAL;
    }

    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }

    const degradedCount = statuses.filter((s) => s === HealthStatus.DEGRADED).length;
    if (degradedCount >= 2) {
      return HealthStatus.DEGRADED;
    }

    if (statuses.includes(HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  /**
   * Get current health status
   */
  getHealth(): SystemHealth {
    const checks = Array.from(this.healthChecks.values());
    const overall = this.calculateOverallHealth(checks);

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Get health for specific component
   */
  getComponentHealth(component: string): HealthCheck | null {
    return this.healthChecks.get(component) || null;
  }

  /**
   * Start continuous health monitoring
   */
  private startMonitoring(): void {
    // Run health check every 30 seconds
    setInterval(async () => {
      try {
        const health = await this.checkHealth();

        // Log health status
        console.log(`[HealthMonitor] Overall: ${health.overall}`);

        // Log any issues
        const issues = health.checks.filter(
          (c) => c.status !== HealthStatus.HEALTHY
        );

        if (issues.length > 0) {
          console.warn('[HealthMonitor] Issues detected:');
          issues.forEach((issue) => {
            console.warn(`  - ${issue.component}: ${issue.message}`);
          });
        }

        // Trigger alerts if critical
        if (health.overall === HealthStatus.CRITICAL) {
          this.triggerAlert(health);
        }
      } catch (error: any) {
        console.error('[HealthMonitor] Health check failed:', error.message);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Trigger alert (can be extended to send notifications)
   */
  private triggerAlert(health: SystemHealth): void {
    console.error(
      '🚨 [HealthMonitor] CRITICAL ALERT 🚨'
    );
    console.error('System health is critical!');
    console.error('Issues:');

    health.checks
      .filter((c) => c.status === HealthStatus.CRITICAL || c.status === HealthStatus.UNHEALTHY)
      .forEach((check) => {
        console.error(`  - ${check.component}: ${check.message}`);
      });

    // TODO: Send email, Slack, PagerDuty, etc.
  }

  /**
   * Get uptime in human-readable format
   */
  getUptime(): string {
    const uptime = Date.now() - this.startTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get formatted health report
   */
  getHealthReport(): string {
    const health = this.getHealth();
    const lines: string[] = [];

    lines.push('=== System Health Report ===');
    lines.push(`Overall Status: ${health.overall.toUpperCase()}`);
    lines.push(`Uptime: ${this.getUptime()}`);
    lines.push('');
    lines.push('Component Status:');

    health.checks.forEach((check) => {
      const icon = {
        [HealthStatus.HEALTHY]: '✓',
        [HealthStatus.DEGRADED]: '⚠',
        [HealthStatus.UNHEALTHY]: '✗',
        [HealthStatus.CRITICAL]: '🚨',
      }[check.status];

      lines.push(`  ${icon} ${check.component}: ${check.message}`);

      if (check.details && check.status !== HealthStatus.HEALTHY) {
        lines.push(`     Details: ${JSON.stringify(check.details, null, 2).replace(/\n/g, '\n     ')}`);
      }
    });

    lines.push('');
    lines.push('===========================');

    return lines.join('\n');
  }
}

// Singleton instance
let healthMonitor: HealthMonitor | null = null;

/**
 * Get the singleton Health Monitor instance
 */
export function getHealthMonitor(): HealthMonitor {
  if (!healthMonitor) {
    healthMonitor = new HealthMonitor();
  }
  return healthMonitor;
}

/**
 * Initialize health monitoring
 */
export function initHealthMonitoring(): HealthMonitor {
  return getHealthMonitor();
}
