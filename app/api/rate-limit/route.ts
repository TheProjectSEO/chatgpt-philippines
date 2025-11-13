import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get client IP with multiple fallbacks (works with Vercel, Cloudflare, etc.)
function getClientIP(request: NextRequest): string {
  // Cloudflare
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  // Standard proxy headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP) return xRealIP;

  // Vercel-specific
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP.split(',')[0].trim();

  return 'unknown';
}

// Generate browser fingerprint from headers and client hints
function getBrowserFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEnc = request.headers.get('accept-encoding') || '';
  const secChUa = request.headers.get('sec-ch-ua') || '';
  const secChUaPlatform = request.headers.get('sec-ch-ua-platform') || '';

  // Combine all identifying information
  const fingerprintString = `${userAgent}|${acceptLang}|${acceptEnc}|${secChUa}|${secChUaPlatform}`;

  // Simple but effective hash
  const fingerprint = Buffer.from(fingerprintString).toString('base64').slice(0, 40);

  return fingerprint;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ip = getClientIP(request);
    const fingerprint = getBrowserFingerprint(request);
    const { action = 'check' } = await request.json();

    // Check rate limit in database
    // Look for existing record matching EITHER IP OR fingerprint (this prevents VPN bypass)
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .or(`ip.eq.${ip},fingerprint.eq.${fingerprint}`)
      .order('message_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database query error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (action === 'increment') {
      // Check if we need to reset (no existing record or last reset was over 24 hours ago)
      if (!existing || new Date(existing.last_reset) < oneDayAgo) {
        // Create new or reset existing
        const { error: upsertError } = await supabase
          .from('rate_limits')
          .upsert({
            ip,
            fingerprint,
            message_count: 1,
            last_reset: now.toISOString(),
            last_activity: now.toISOString(),
          }, {
            onConflict: 'ip,fingerprint'
          });

        if (upsertError) {
          console.error('Database upsert error:', upsertError);
          return NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          count: 1,
          limit: 10,
          remaining: 9,
          blocked: false
        });
      } else {
        // Increment existing
        const newCount = existing.message_count + 1;

        const { error: updateError } = await supabase
          .from('rate_limits')
          .update({
            message_count: newCount,
            last_activity: now.toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          return NextResponse.json(
            { error: 'Database error' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          count: newCount,
          limit: 10,
          remaining: Math.max(0, 10 - newCount),
          blocked: newCount >= 10
        });
      }
    }

    // Default: check current status
    if (!existing || new Date(existing.last_reset) < oneDayAgo) {
      return NextResponse.json({
        count: 0,
        limit: 10,
        remaining: 10,
        blocked: false
      });
    }

    return NextResponse.json({
      count: existing.message_count,
      limit: 10,
      remaining: Math.max(0, 10 - existing.message_count),
      blocked: existing.message_count >= 10
    });
  } catch (error) {
    console.error('Rate limit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET requests to check rate limit status without incrementing
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ip = getClientIP(request);
    const fingerprint = getBrowserFingerprint(request);

    const { data: existing } = await supabase
      .from('rate_limits')
      .select('*')
      .or(`ip.eq.${ip},fingerprint.eq.${fingerprint}`)
      .order('message_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!existing || new Date(existing.last_reset) < oneDayAgo) {
      return NextResponse.json({
        count: 0,
        limit: 10,
        remaining: 10,
        blocked: false
      });
    }

    return NextResponse.json({
      count: existing.message_count,
      limit: 10,
      remaining: Math.max(0, 10 - existing.message_count),
      blocked: existing.message_count >= 10
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
