import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { sub: auth0Id, email, name, picture } = session.user;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single();

    if (existingUser) {
      // User exists, return their data
      return NextResponse.json({ user: existingUser });
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        auth0_id: auth0Id,
        email: email,
        name: name,
        avatar_url: picture,
        query_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync user' },
      { status: 500 }
    );
  }
}
