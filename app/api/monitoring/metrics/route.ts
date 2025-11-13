/**
 * Prometheus Metrics API Endpoint
 * Returns metrics in Prometheus format
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMetricsCollector } from '@/lib/scaling/metricsCollector';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const metricsCollector = getMetricsCollector();
    const format = req.nextUrl.searchParams.get('format') || 'prometheus';

    if (format === 'json') {
      const metrics = metricsCollector.getMetricsJSON();
      return NextResponse.json(metrics);
    } else {
      // Prometheus format
      const prometheusMetrics = metricsCollector.getPrometheusMetrics();
      return new NextResponse(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
        },
      });
    }
  } catch (error: any) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
