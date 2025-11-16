import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Using Node.js runtime instead of Edge for better Supabase compatibility
// export const runtime = 'edge';

interface PageViewData {
  pagePath: string;
  pageTitle: string;
  referrer?: string;
  timeOnPage?: number;
  scrollDepth?: number;
}

// Helper to create Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// Detect device type from user agent
const getDeviceType = (userAgent: string): 'mobile' | 'tablet' | 'desktop' => {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get browser info from user agent
const getBrowserInfo = (userAgent: string): { name: string; version: string } => {
  const ua = userAgent.toLowerCase();
  let name = 'Other';
  let version = '';

  if (ua.includes('firefox')) {
    name = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('chrome') && !ua.includes('edge')) {
    name = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    name = 'Safari';
    const match = ua.match(/version\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  } else if (ua.includes('edge')) {
    name = 'Edge';
    const match = ua.match(/edge\/(\d+\.\d+)/);
    version = match ? match[1] : '';
  }

  return { name, version };
};

// Get OS from user agent
const getOS = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Other';
};

// GET endpoint for retrieving page views
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pagePath = searchParams.get('path');
    const groupBy = searchParams.get('groupBy'); // 'path', 'device', 'browser'

    // Build query
    let query = supabase.from('page_views').select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (pagePath) {
      query = query.eq('page_path', pagePath);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);

    if (error) {
      console.error('[Page Views API] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch page views' },
        { status: 500 }
      );
    }

    // If groupBy is specified, aggregate the data
    if (groupBy && data) {
      const aggregated = aggregatePageViews(data, groupBy);
      return NextResponse.json({ pageViews: aggregated }, { status: 200 });
    }

    return NextResponse.json({ pageViews: data || [] }, { status: 200 });
  } catch (error) {
    console.error('[Page Views API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to aggregate page views
function aggregatePageViews(data: any[], groupBy: string) {
  const grouped = data.reduce((acc, item) => {
    let key = '';
    if (groupBy === 'path') key = item.page_path;
    else if (groupBy === 'device') key = item.device_type;
    else if (groupBy === 'browser') key = item.browser_name;

    if (!acc[key]) {
      acc[key] = {
        key,
        count: 0,
        uniqueVisitors: new Set(),
        avgTimeOnPage: [],
        avgScrollDepth: [],
      };
    }

    acc[key].count++;
    if (item.visitor_id) acc[key].uniqueVisitors.add(item.visitor_id);
    if (item.time_on_page) acc[key].avgTimeOnPage.push(item.time_on_page);
    if (item.scroll_depth) acc[key].avgScrollDepth.push(item.scroll_depth);

    return acc;
  }, {} as any);

  return Object.values(grouped).map((group: any) => ({
    key: group.key,
    views: group.count,
    uniqueVisitors: group.uniqueVisitors.size,
    avgTimeOnPage: group.avgTimeOnPage.length > 0
      ? Math.round(group.avgTimeOnPage.reduce((a: number, b: number) => a + b, 0) / group.avgTimeOnPage.length)
      : 0,
    avgScrollDepth: group.avgScrollDepth.length > 0
      ? Math.round(group.avgScrollDepth.reduce((a: number, b: number) => a + b, 0) / group.avgScrollDepth.length)
      : 0,
  }));
}

// POST endpoint for tracking page views
export async function POST(req: NextRequest) {
  try {
    const data: PageViewData = await req.json();
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Get anonymous session and visitor IDs using Web Crypto API
    const sessionId = req.headers.get('x-session-id') ||
                     req.cookies.get('session_id')?.value ||
                     globalThis.crypto.randomUUID();
    const visitorId = req.cookies.get('visitor_id')?.value ||
                     globalThis.crypto.randomUUID();

    // Store in Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      const browserInfo = getBrowserInfo(userAgent);

      const { error } = await supabase.from('page_views').insert({
        page_path: data.pagePath,
        page_title: data.pageTitle,
        referrer: data.referrer || null,
        session_id: sessionId,
        visitor_id: visitorId,
        device_type: getDeviceType(userAgent),
        browser_name: browserInfo.name,
        browser_version: browserInfo.version,
        os_name: getOS(userAgent),
        time_on_page: data.timeOnPage || null,
        scroll_depth: data.scrollDepth || null,
        viewed_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[Page Views] Database error:', error);
      }
    }

    // Set visitor ID cookie if not present
    const response = NextResponse.json({ success: true }, { status: 200 });
    if (!req.cookies.get('visitor_id')) {
      response.cookies.set('visitor_id', visitorId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('[Page Views] Error:', error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
