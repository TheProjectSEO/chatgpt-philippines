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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existingUser) {
      return NextResponse.json({ userId: existingUser.id });
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ session_id: sessionId })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ userId: newUser.id });
  } catch (error: any) {
    console.error('Error initializing user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize user' },
      { status: 500 }
    );
  }
}
