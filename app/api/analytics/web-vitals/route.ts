import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType?: string;
  path: string;
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

// Hash user agent for privacy using Web Crypto API
const hashUserAgent = async (userAgent: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(userAgent);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16);
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

// Get browser name from user agent
const getBrowserName = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  return 'Other';
};

// GET endpoint for retrieving web vitals data
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
    const metricName = searchParams.get('metric');
    const pagePath = searchParams.get('path');

    // Build query
    let query = supabase
      .from('web_vitals')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (metricName) {
      query = query.eq('metric_name', metricName);
    }
    if (pagePath) {
      query = query.eq('page_path', pagePath);
    }

    const { data, error } = await query.limit(1000);

    if (error) {
      console.error('[Web Vitals API] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ metrics: data || [] }, { status: 200 });
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for submitting web vitals metrics
export async function POST(req: NextRequest) {
  try {
    const metric: WebVitalMetric = await req.json();
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const url = new URL(req.url);

    // Log metric for debugging
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: metric.path,
    });

    // Store in Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      // Generate anonymous session ID from request
      const sessionId = req.headers.get('x-session-id') ||
                       req.cookies.get('session_id')?.value ||
                       globalThis.crypto.randomUUID();

      const { error } = await supabase.from('web_vitals').insert({
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        metric_id: metric.id,
        page_url: url.origin + metric.path,
        page_path: metric.path,
        navigation_type: metric.navigationType || 'navigate',
        session_id: sessionId,
        user_agent_hash: hashUserAgent(userAgent),
        device_type: getDeviceType(userAgent),
        browser_name: getBrowserName(userAgent),
      });

      if (error) {
        console.error('[Web Vitals] Database error:', error);
        // Don't fail the request if analytics fails
      }
    }

    // Alert on poor metrics
    if (metric.rating === 'poor') {
      console.warn(`[Web Vitals] POOR ${metric.name}: ${metric.value}`, {
        path: metric.path,
        deviceType: getDeviceType(userAgent),
        browser: getBrowserName(userAgent),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Web Vitals] Error processing metric:', error);
    // Return success to not block client
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
