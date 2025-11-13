import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { chat, userId } = await req.json();

    const { error } = await supabase.from('chats').upsert({
      id: chat.id,
      user_id: userId,
      title: chat.title,
      model: chat.model,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save chat' },
      { status: 500 }
    );
  }
}
