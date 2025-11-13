/**
 * Monitoring Dashboard API
 * Returns comprehensive system status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHealthMonitor } from '@/lib/scaling/healthMonitor';
import { getAPIKeyManager } from '@/lib/scaling/apiKeyManager';
import { getCacheManager } from '@/lib/scaling/cacheManager';
import { getSemanticCache } from '@/lib/scaling/semanticCache';
import { getAllQueues } from '@/lib/scaling/queueManager';
import { getAllWorkerManagers } from '@/lib/scaling/workerManager';
import { getMetricsCollector } from '@/lib/scaling/metricsCollector';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const healthMonitor = getHealthMonitor();
    const health = await healthMonitor.checkHealth();

    // API Keys
    const apiKeyManager = getAPIKeyManager();
    const apiKeyMetrics = apiKeyManager.getMetrics();
    const apiKeyCapacity = apiKeyManager.getTotalCapacity();
    const apiKeyAlerts = apiKeyManager.getQuotaAlerts();

    // Cache
    const cacheManager = getCacheManager();
    const cacheStats = cacheManager.getStats();
    const topCacheEntries = cacheManager.getTopEntries(10);

    // Semantic Cache
    const semanticCache = getSemanticCache();
    const semanticCacheStats = semanticCache.getStats();

    // Queues
    const queues = getAllQueues();
    const queueStats: any = {};
    queues.forEach((queue, name) => {
      queueStats[name] = queue.getStats();
    });

    // Workers
    const workerManagers = getAllWorkerManagers();
    const workerStats: any = {};
    workerManagers.forEach((manager, name) => {
      workerStats[name] = manager.getAggregateStats();
    });

    // Metrics
    const metricsCollector = getMetricsCollector();
    const metricsSummary = metricsCollector.getSummary();

    const dashboard = {
      health: {
        overall: health.overall,
        uptime: healthMonitor.getUptime(),
        checks: health.checks,
      },
      apiKeys: {
        metrics: apiKeyMetrics,
        capacity: apiKeyCapacity,
        alerts: apiKeyAlerts.slice(-10), // Last 10 alerts
      },
      cache: {
        stats: cacheStats,
        topEntries: topCacheEntries,
      },
      semanticCache: {
        stats: semanticCacheStats,
      },
      queues: queueStats,
      workers: workerStats,
      metrics: metricsSummary,
      timestamp: Date.now(),
    };

    return NextResponse.json(dashboard);
  } catch (error: any) {
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
