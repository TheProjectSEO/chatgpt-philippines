import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FREE_QUERY_LIMIT = 10;

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('query_count')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      return NextResponse.json({
        canQuery: true,
        queriesRemaining: FREE_QUERY_LIMIT,
        queryCount: 0,
        needsPayment: false,
      });
    }

    const queryCount = user.query_count || 0;
    const canQuery = queryCount < FREE_QUERY_LIMIT;
    const queriesRemaining = Math.max(0, FREE_QUERY_LIMIT - queryCount);

    return NextResponse.json({
      canQuery,
      queriesRemaining,
      queryCount,
      needsPayment: !canQuery,
    });
  } catch (error: any) {
    console.error('Error checking rate limit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check rate limit' },
      { status: 500 }
    );
  }
}
