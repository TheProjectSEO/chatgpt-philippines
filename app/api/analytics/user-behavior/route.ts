import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Using Node.js runtime instead of Edge for better Supabase compatibility
// export const runtime = 'edge';

interface UserEventData {
  eventType: 'click' | 'form_submit' | 'tool_usage' | 'download' | 'search' | 'share' | 'copy' | 'error';
  eventName: string;
  eventData?: Record<string, any>;
  pagePath: string;
  toolName?: string;
  toolAction?: string;
  inputLength?: number;
  outputLength?: number;
  processingTime?: number;
  success?: boolean;
  errorType?: string;
  modelUsed?: string;
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

// GET endpoint for retrieving user behavior data
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
    const eventType = searchParams.get('eventType');
    const pagePath = searchParams.get('path');
    const dataType = searchParams.get('type'); // 'events' or 'tools'

    if (dataType === 'tools') {
      // Get tool usage analytics
      let toolQuery = supabase.from('tool_usage_analytics').select('*');

      if (startDate) toolQuery = toolQuery.gte('created_at', startDate);
      if (endDate) toolQuery = toolQuery.lte('created_at', endDate);

      const { data, error } = await toolQuery
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('[User Behavior API] Tool query error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch tool usage' },
          { status: 500 }
        );
      }

      return NextResponse.json({ toolUsage: data || [] }, { status: 200 });
    } else {
      // Get user events
      let eventQuery = supabase.from('user_events').select('*');

      if (startDate) eventQuery = eventQuery.gte('created_at', startDate);
      if (endDate) eventQuery = eventQuery.lte('created_at', endDate);
      if (eventType) eventQuery = eventQuery.eq('event_type', eventType);
      if (pagePath) eventQuery = eventQuery.eq('page_path', pagePath);

      const { data, error } = await eventQuery
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('[User Behavior API] Event query error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch events' },
          { status: 500 }
        );
      }

      return NextResponse.json({ events: data || [] }, { status: 200 });
    }
  } catch (error) {
    console.error('[User Behavior API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for tracking user behavior
export async function POST(req: NextRequest) {
  try {
    const data: UserEventData = await req.json();

    // Get anonymous session and visitor IDs
    const sessionId = req.headers.get('x-session-id') ||
                     req.cookies.get('session_id')?.value ||
                     globalThis.crypto.randomUUID();
    const visitorId = req.cookies.get('visitor_id')?.value ||
                     globalThis.crypto.randomUUID();

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If this is a tool usage event, store in tool_usage_analytics table
    if (data.eventType === 'tool_usage' && data.toolName) {
      const { error: toolError } = await supabase.from('tool_usage_analytics').insert({
        tool_name: data.toolName,
        tool_action: data.toolAction || 'use',
        input_length: data.inputLength || null,
        output_length: data.outputLength || null,
        processing_time: data.processingTime || null,
        success: data.success !== undefined ? data.success : true,
        error_type: data.errorType || null,
        session_id: sessionId,
        visitor_id: visitorId,
        model_used: data.modelUsed || null,
        used_at: new Date().toISOString(),
      });

      if (toolError) {
        console.error('[User Behavior] Tool usage error:', toolError);
      }
    }

    // Store event in user_events table
    const { error: eventError } = await supabase.from('user_events').insert({
      event_type: data.eventType,
      event_name: data.eventName,
      event_data: data.eventData ? JSON.stringify(data.eventData) : null,
      page_path: data.pagePath,
      session_id: sessionId,
      visitor_id: visitorId,
      occurred_at: new Date().toISOString(),
    });

    if (eventError) {
      console.error('[User Behavior] Event error:', eventError);
    }

    // Log significant events
    if (data.eventType === 'error') {
      console.warn('[User Behavior] Error event:', {
        name: data.eventName,
        path: data.pagePath,
        errorType: data.errorType,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[User Behavior] Error:', error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
