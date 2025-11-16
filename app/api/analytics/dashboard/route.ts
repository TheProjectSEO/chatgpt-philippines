import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Using Node.js runtime instead of Edge for better Supabase compatibility
// export const runtime = 'edge';

// Helper to create Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// GET endpoint for dashboard aggregated data
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Analytics not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    // Fetch all analytics data in parallel
    const [
      webVitalsResult,
      pageViewsResult,
      toolUsageResult,
      eventsResult,
    ] = await Promise.all([
      // Web Vitals Summary
      supabase.rpc('get_web_vitals_summary', {
        start_date: startDate,
        end_date: endDate,
        metric_filter: null,
      }),

      // Page Views by Path
      supabase.rpc('get_page_views_by_path', {
        start_date: startDate,
        end_date: endDate,
        limit_count: 10,
      }),

      // Tool Usage Stats
      supabase.rpc('get_tool_usage_stats', {
        start_date: startDate,
        end_date: endDate,
        limit_count: 10,
      }),

      // User Funnel
      supabase.rpc('get_user_funnel', {
        start_date: startDate,
        end_date: endDate,
      }),
    ]);

    // Check for errors
    if (webVitalsResult.error) {
      console.error('[Dashboard API] Web Vitals error:', webVitalsResult.error);
    }
    if (pageViewsResult.error) {
      console.error('[Dashboard API] Page Views error:', pageViewsResult.error);
    }
    if (toolUsageResult.error) {
      console.error('[Dashboard API] Tool Usage error:', toolUsageResult.error);
    }
    if (eventsResult.error) {
      console.error('[Dashboard API] Events error:', eventsResult.error);
    }

    // Get total counts
    const [totalPageViews, totalToolUsage, totalEvents] = await Promise.all([
      supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('tool_usage_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('user_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),
    ]);

    // Get unique visitors count
    const { data: uniqueVisitorsData } = await supabase
      .from('page_views')
      .select('visitor_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const uniqueVisitors = new Set(
      uniqueVisitorsData?.map(v => v.visitor_id).filter(Boolean) || []
    ).size;

    // Get time series data for charts (daily breakdown)
    const { data: dailyPageViews } = await supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    const { data: dailyToolUsage } = await supabase
      .from('tool_usage_analytics')
      .select('created_at, tool_name')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    // Aggregate daily data
    const dailyData = aggregateDailyData(dailyPageViews || [], dailyToolUsage || []);

    // Get device breakdown
    const { data: deviceData } = await supabase
      .from('page_views')
      .select('device_type')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const deviceBreakdown = aggregateByField(deviceData || [], 'device_type');

    // Get browser breakdown
    const { data: browserData } = await supabase
      .from('page_views')
      .select('browser_name')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const browserBreakdown = aggregateByField(browserData || [], 'browser_name');

    // Compile dashboard data
    const dashboardData = {
      summary: {
        totalPageViews: totalPageViews.count || 0,
        uniqueVisitors,
        totalToolUsage: totalToolUsage.count || 0,
        totalEvents: totalEvents.count || 0,
      },
      webVitals: webVitalsResult.data || [],
      topPages: pageViewsResult.data || [],
      topTools: toolUsageResult.data || [],
      userFunnel: eventsResult.data || [],
      dailyData,
      deviceBreakdown,
      browserBreakdown,
      dateRange: {
        startDate,
        endDate,
      },
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to aggregate daily data
function aggregateDailyData(pageViews: any[], toolUsage: any[]) {
  const dailyMap = new Map<string, { date: string; pageViews: number; toolUsage: number }>();

  // Process page views
  pageViews.forEach(view => {
    const date = new Date(view.created_at).toISOString().split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, pageViews: 0, toolUsage: 0 });
    }
    dailyMap.get(date)!.pageViews++;
  });

  // Process tool usage
  toolUsage.forEach(usage => {
    const date = new Date(usage.created_at).toISOString().split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, pageViews: 0, toolUsage: 0 });
    }
    dailyMap.get(date)!.toolUsage++;
  });

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to aggregate data by field
function aggregateByField(data: any[], field: string) {
  const counts = data.reduce((acc, item) => {
    const value = item[field] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => (b.count as number) - (a.count as number));
}
