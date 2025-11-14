/**
 * Metrics endpoint for Prometheus scraping
 * Returns metrics in Prometheus text format
 */

import { NextResponse } from 'next/server';
import { getAPIKeyManager } from '@/lib/apiKeyManager';
import { getCacheManager } from '@/lib/cache';
import { getQueueManager } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metrics: string[] = [];

  try {
    // API Key Metrics
    try {
      const apiKeyManager = getAPIKeyManager();
      const health = apiKeyManager.getHealthStatus();
      const capacity = apiKeyManager.getTotalCapacity();
      const alerts = apiKeyManager.getUsageAlerts();

      metrics.push('# HELP api_keys_total Total number of API keys');
      metrics.push('# TYPE api_keys_total gauge');
      metrics.push(`api_keys_total ${health.totalKeys}`);

      metrics.push('# HELP api_keys_healthy Number of healthy API keys');
      metrics.push('# TYPE api_keys_healthy gauge');
      metrics.push(`api_keys_healthy ${health.healthy}`);

      metrics.push('# HELP api_keys_degraded Number of degraded API keys');
      metrics.push('# TYPE api_keys_degraded gauge');
      metrics.push(`api_keys_degraded ${health.degraded}`);

      metrics.push('# HELP api_keys_circuit_open Number of API keys with circuit open');
      metrics.push('# TYPE api_keys_circuit_open gauge');
      metrics.push(`api_keys_circuit_open ${health.circuitOpen}`);

      metrics.push('# HELP api_requests_per_minute_current Current requests per minute');
      metrics.push('# TYPE api_requests_per_minute_current gauge');
      metrics.push(`api_requests_per_minute_current ${capacity.currentRPM}`);

      metrics.push('# HELP api_requests_per_minute_max Maximum requests per minute');
      metrics.push('# TYPE api_requests_per_minute_max gauge');
      metrics.push(`api_requests_per_minute_max ${capacity.maxRPM}`);

      metrics.push('# HELP api_requests_daily_current Current daily requests');
      metrics.push('# TYPE api_requests_daily_current gauge');
      metrics.push(`api_requests_daily_current ${capacity.currentDaily}`);

      metrics.push('# HELP api_requests_daily_max Maximum daily requests');
      metrics.push('# TYPE api_requests_daily_max gauge');
      metrics.push(`api_requests_daily_max ${capacity.maxDaily}`);

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

    // Queue Metrics
    try {
      const queue = await getQueueManager();
      const stats = await queue.getStats();

      metrics.push('# HELP queue_pending Total number of pending jobs');
      metrics.push('# TYPE queue_pending gauge');
      metrics.push(`queue_pending ${stats.pending}`);

      metrics.push('# HELP queue_processing Total number of processing jobs');
      metrics.push('# TYPE queue_processing gauge');
      metrics.push(`queue_processing ${stats.processing}`);

      metrics.push('# HELP queue_completed_total Total number of completed jobs');
      metrics.push('# TYPE queue_completed_total counter');
      metrics.push(`queue_completed_total ${stats.completed}`);

      metrics.push('# HELP queue_failed_total Total number of failed jobs');
      metrics.push('# TYPE queue_failed_total counter');
      metrics.push(`queue_failed_total ${stats.failed}`);

      metrics.push(
        '# HELP queue_wait_time_avg_ms Average wait time in milliseconds'
      );
      metrics.push('# TYPE queue_wait_time_avg_ms gauge');
      metrics.push(`queue_wait_time_avg_ms ${stats.averageWaitTime}`);

      metrics.push(
        '# HELP queue_processing_time_avg_ms Average processing time in milliseconds'
      );
      metrics.push('# TYPE queue_processing_time_avg_ms gauge');
      metrics.push(`queue_processing_time_avg_ms ${stats.averageProcessingTime}`);
    } catch (error) {
      console.error('[Metrics] Queue metrics error:', error);
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
