import { Chat, Message, AnthropicModel } from './types';

// Generate a session ID for the user
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('chatgpt-ph-session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('chatgpt-ph-session', sessionId);
  }
  return sessionId;
}

interface RateLimitStatus {
  canQuery: boolean;
  queriesRemaining: number;
  queryCount: number;
  needsPayment: boolean;
}

export const supabaseClient = {
  // Initialize user session
  async initUser(): Promise<string> {
    const sessionId = getSessionId();

    try {
      const response = await fetch('/api/supabase/init-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      return data.userId;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  },

  // Check rate limit status
  async checkRateLimit(): Promise<RateLimitStatus> {
    const sessionId = getSessionId();

    try {
      const response = await fetch('/api/supabase/check-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return {
        canQuery: true,
        queriesRemaining: 10,
        queryCount: 0,
        needsPayment: false,
      };
    }
  },

  // Increment query count
  async incrementQueryCount(): Promise<void> {
    const sessionId = getSessionId();

    try {
      await fetch('/api/supabase/increment-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Error incrementing query count:', error);
    }
  },

  // Save chat to Supabase
  async saveChat(chat: Chat, userId: string): Promise<void> {
    try {
      await fetch('/api/supabase/save-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat, userId }),
      });
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  },

  // Save message to Supabase
  async saveMessage(chatId: string, message: Message): Promise<void> {
    try {
      await fetch('/api/supabase/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  },

  // Load chats from Supabase
  async loadChats(userId: string): Promise<Chat[]> {
    try {
      const response = await fetch(`/api/supabase/load-chats?userId=${userId}`);
      const data = await response.json();
      return data.chats || [];
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  },
};
