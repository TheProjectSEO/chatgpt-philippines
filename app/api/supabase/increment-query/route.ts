import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const { error } = await supabase.rpc('increment_query_count', {
      p_session_id: sessionId,
    });

    if (error) {
      // Fallback: manual increment
      const { data: user } = await supabase
        .from('users')
        .select('id, query_count')
        .eq('session_id', sessionId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            query_count: (user.query_count || 0) + 1,
            last_query_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error incrementing query count:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to increment query count' },
      { status: 500 }
    );
  }
}
