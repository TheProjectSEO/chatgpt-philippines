/**
 * Health check endpoint for monitoring and load balancers
 */

import { NextResponse } from 'next/server';
import { getAPIKeyManager } from '@/lib/apiKeyManager';
import { getCacheManager } from '@/lib/cache';

export const dynamic = 'force-dynamic';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    apiKeys: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      details: any;
    };
    cache: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      details: any;
    };
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      details: any;
    };
  };
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Check API Key Manager
    let apiKeyStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let apiKeyDetails: any = {};

    try {
      const apiKeyManager = getAPIKeyManager();
      const health = apiKeyManager.getHealthStatus();
      const alerts = apiKeyManager.getUsageAlerts();

      if (health.circuitOpen > 0) {
        apiKeyStatus = 'unhealthy';
      } else if (alerts.some((a) => a.level === 'critical')) {
        apiKeyStatus = 'degraded';
      }

      apiKeyDetails = {
        totalKeys: health.totalKeys,
        healthy: health.healthy,
        circuitOpen: health.circuitOpen,
        alerts: alerts.length,
      };
    } catch (error) {
      apiKeyStatus = 'unhealthy';
      apiKeyDetails = { error: 'Failed to check API keys' };
    }

    // Check Cache
    let cacheStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let cacheDetails: any = {};

    try {
      const cache = await getCacheManager();
      const stats = await cache.getStats();
      cacheDetails = {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hitRate,
        totalEntries: stats.totalEntries,
      };

      // Consider degraded if hit rate is below 30%
      const hitRateNum = parseFloat(stats.hitRate);
      if (hitRateNum < 30 && stats.hits + stats.misses > 100) {
        cacheStatus = 'degraded';
      }
    } catch (error) {
      cacheStatus = 'degraded'; // Cache is optional, so degraded not unhealthy
      cacheDetails = { error: 'Cache not available, using fallback' };
    }

    // Check Database (Supabase)
    let databaseStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let databaseDetails: any = {};

    try {
      // Simple ping to check if Supabase is reachable
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          databaseDetails = { latency: `${Date.now() - startTime}ms` };
        } else {
          databaseStatus = 'degraded';
          databaseDetails = { error: `HTTP ${response.status}` };
        }
      } else {
        databaseStatus = 'unhealthy';
        databaseDetails = { error: 'Database URL not configured' };
      }
    } catch (error: any) {
      databaseStatus = 'unhealthy';
      databaseDetails = { error: error.message };
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (
      apiKeyStatus === 'unhealthy' ||
      databaseStatus === 'unhealthy'
    ) {
      overallStatus = 'unhealthy';
    } else if (
      apiKeyStatus === 'degraded' ||
      cacheStatus === 'degraded' ||
      databaseStatus === 'degraded'
    ) {
      overallStatus = 'degraded';
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        apiKeys: {
          status: apiKeyStatus,
          details: apiKeyDetails,
        },
        cache: {
          status: cacheStatus,
          details: cacheDetails,
        },
        database: {
          status: databaseStatus,
          details: databaseDetails,
        },
      },
    };

    // Return appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
