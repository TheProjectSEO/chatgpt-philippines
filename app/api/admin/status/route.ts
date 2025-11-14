/**
 * Admin status dashboard endpoint
 * Provides detailed status information for administrators
 */

import { NextResponse } from 'next/server';
import { getAPIKeyManager } from '@/lib/apiKeyManager';
import { getCacheManager } from '@/lib/cache';
import { getQueueManager } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
    };

    // API Key Status
    try {
      const apiKeyManager = getAPIKeyManager();
      status.apiKeys = {
        health: apiKeyManager.getHealthStatus(),
        capacity: apiKeyManager.getTotalCapacity(),
        alerts: apiKeyManager.getUsageAlerts(),
      };
    } catch (error: any) {
      status.apiKeys = { error: error.message };
    }

    // Cache Status
    try {
      const cache = await getCacheManager();
      status.cache = await cache.getStats();
    } catch (error: any) {
      status.cache = { error: error.message };
    }

    // Queue Status
    try {
      const queue = await getQueueManager();
      status.queue = await queue.getStats();

      // Get DLQ jobs
      const dlqJobs = await queue.getDLQJobs(5);
      status.queue.deadLetterQueue = {
        count: dlqJobs.length,
        recentJobs: dlqJobs.map((job) => ({
          id: job.id,
          error: job.error,
          attempts: job.attempts,
          createdAt: new Date(job.createdAt).toISOString(),
        })),
      };
    } catch (error: any) {
      status.queue = { error: error.message };
    }

    // System Status
    status.system = {
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('[Admin Status] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for administrative actions
 */
export async function POST(req: Request) {
  try {
    const { action, params } = await req.json();

    switch (action) {
      case 'clear_cache':
        const cache = await getCacheManager();
        await cache.clear();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      case 'clear_queue':
        const queue = await getQueueManager();
        await queue.clear();
        return NextResponse.json({ success: true, message: 'Queue cleared' });

      case 'retry_dlq_job':
        const queueRetry = await getQueueManager();
        const success = await queueRetry.retryDLQJob(params.jobId);
        return NextResponse.json({
          success,
          message: success ? 'Job retried' : 'Job not found',
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[Admin Status] Action error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
