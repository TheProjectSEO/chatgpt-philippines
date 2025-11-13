/**
 * Health Monitoring API Endpoint
 * Returns system health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHealthMonitor } from '@/lib/scaling/healthMonitor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const healthMonitor = getHealthMonitor();
    const health = await healthMonitor.checkHealth();

    const statusCode = {
      healthy: 200,
      degraded: 200,
      unhealthy: 503,
      critical: 503,
    }[health.overall] || 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    console.error('[Health API] Error:', error);
    return NextResponse.json(
      {
        overall: 'unhealthy',
        error: error.message,
        timestamp: Date.now(),
      },
      { status: 503 }
    );
  }
}
