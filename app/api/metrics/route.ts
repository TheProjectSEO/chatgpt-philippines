/**
 * Metrics endpoint for Prometheus scraping
 * Returns metrics in Prometheus text format
 */

import { NextResponse } from 'next/server';
import { getAPIKeyManager } from '@/lib/apiKeyManager';
import { getCacheManager } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metrics: string[] = [];

  try {
    // API Key Metrics
    try {
      const apiKeyManager = getAPIKeyManager();
      const health = apiKeyManager.getHealthStatus();
      const alerts = apiKeyManager.getUsageAlerts();

      metrics.push('# HELP api_keys_total Total number of API keys');
      metrics.push('# TYPE api_keys_total gauge');
      metrics.push(`api_keys_total ${health.totalKeys}`);

      metrics.push('# HELP api_keys_healthy Number of healthy API keys');
      metrics.push('# TYPE api_keys_healthy gauge');
      metrics.push(`api_keys_healthy ${health.healthy}`);


      metrics.push('# HELP api_keys_circuit_open Number of API keys with circuit open');
      metrics.push('# TYPE api_keys_circuit_open gauge');
      metrics.push(`api_keys_circuit_open ${health.circuitOpen}`);

      metrics.push('# HELP api_alerts_total Total number of API alerts');
      metrics.push('# TYPE api_alerts_total gauge');
      metrics.push(`api_alerts_total ${alerts.length}`);

      metrics.push(
        '# HELP api_alerts_critical Number of critical API alerts'
      );
      metrics.push('# TYPE api_alerts_critical gauge');
      metrics.push(
        `api_alerts_critical ${alerts.filter((a) => a.level === 'critical').length}`
      );
    } catch (error) {
      console.error('[Metrics] API Key metrics error:', error);
    }

    // Cache Metrics
    try {
      const cache = await getCacheManager();
      const stats = await cache.getStats();

      metrics.push('# HELP cache_hits_total Total number of cache hits');
      metrics.push('# TYPE cache_hits_total counter');
      metrics.push(`cache_hits_total ${stats.hits}`);

      metrics.push('# HELP cache_misses_total Total number of cache misses');
      metrics.push('# TYPE cache_misses_total counter');
      metrics.push(`cache_misses_total ${stats.misses}`);

      const hitRate = parseFloat(stats.hitRate);
      metrics.push('# HELP cache_hit_rate Cache hit rate percentage');
      metrics.push('# TYPE cache_hit_rate gauge');
      metrics.push(`cache_hit_rate ${hitRate}`);

      metrics.push('# HELP cache_entries_total Total number of cache entries');
      metrics.push('# TYPE cache_entries_total gauge');
      metrics.push(`cache_entries_total ${stats.totalEntries}`);
    } catch (error) {
      console.error('[Metrics] Cache metrics error:', error);
    }

    // System Metrics
    metrics.push('# HELP nodejs_uptime_seconds Node.js process uptime in seconds');
    metrics.push('# TYPE nodejs_uptime_seconds gauge');
    metrics.push(`nodejs_uptime_seconds ${process.uptime()}`);

    metrics.push('# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes');
    metrics.push('# TYPE nodejs_memory_usage_bytes gauge');
    const memUsage = process.memoryUsage();
    metrics.push(`nodejs_memory_usage_bytes{type="rss"} ${memUsage.rss}`);
    metrics.push(`nodejs_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`);
    metrics.push(`nodejs_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`);
    metrics.push(`nodejs_memory_usage_bytes{type="external"} ${memUsage.external}`);

    return new NextResponse(metrics.join('\n') + '\n', {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error: any) {
    console.error('[Metrics] Error generating metrics:', error);
    return new NextResponse('# Error generating metrics\n', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
