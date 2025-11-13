import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ chats: [] });
    }

    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (chatsError) throw chatsError;

    // Load messages for each chat
    const chatsWithMessages = await Promise.all(
      (chats || []).map(async (chat) => {
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('timestamp', { ascending: true });

        return {
          id: chat.id,
          title: chat.title,
          model: chat.model,
          createdAt: new Date(chat.created_at).getTime(),
          updatedAt: new Date(chat.updated_at).getTime(),
          messages: (messages || []).map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
          })),
        };
      })
    );

    return NextResponse.json({ chats: chatsWithMessages });
  } catch (error: any) {
    console.error('Error loading chats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load chats' },
      { status: 500 }
    );
  }
}
