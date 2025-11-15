export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          session_id: string;
          created_at: string;
          query_count: number;
          last_query_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          created_at?: string;
          query_count?: number;
          last_query_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          created_at?: string;
          query_count?: number;
          last_query_at?: string | null;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          model: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: string;
          content: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: string;
          content: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: string;
          content?: string;
          timestamp?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          page_type: 'tool' | 'home' | 'static' | 'landing';
          content: Record<string, any>;
          status: 'draft' | 'published' | 'scheduled' | 'archived';
          template?: string;
          layout_config?: Record<string, any>;
          featured_image?: string;
          is_homepage: boolean;
          allow_comments: boolean;
          is_indexable: boolean;
          view_count: number;
          last_viewed_at?: string;
          published_at?: string;
          parent_id?: string;
          sort_order: number;
          created_by?: string;
          updated_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          page_type: 'tool' | 'home' | 'static' | 'landing';
          content: Record<string, any>;
          status?: 'draft' | 'published' | 'scheduled' | 'archived';
          template?: string;
          layout_config?: Record<string, any>;
          featured_image?: string;
          is_homepage?: boolean;
          allow_comments?: boolean;
          is_indexable?: boolean;
          view_count?: number;
          last_viewed_at?: string;
          published_at?: string;
          parent_id?: string;
          sort_order?: number;
          created_by?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          page_type?: 'tool' | 'home' | 'static' | 'landing';
          content?: Record<string, any>;
          status?: 'draft' | 'published' | 'scheduled' | 'archived';
          template?: string;
          layout_config?: Record<string, any>;
          featured_image?: string;
          is_homepage?: boolean;
          allow_comments?: boolean;
          is_indexable?: boolean;
          view_count?: number;
          last_viewed_at?: string;
          published_at?: string;
          parent_id?: string;
          sort_order?: number;
          created_by?: string;
          updated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      seo_metadata: {
        Row: {
          id: string;
          page_id: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string[];
          og_title?: string;
          og_description?: string;
          og_image?: string;
          og_type?: string;
          twitter_card?: string;
          twitter_title?: string;
          twitter_description?: string;
          twitter_image?: string;
          canonical_url?: string;
          alternate_urls?: Record<string, any>[];
          schema_markup?: Record<string, any>;
          robots_index: boolean;
          robots_follow: boolean;
          robots_meta?: string[];
          focus_keyword?: string;
          readability_score?: number;
          seo_score?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string[];
          og_title?: string;
          og_description?: string;
          og_image?: string;
          og_type?: string;
          twitter_card?: string;
          twitter_title?: string;
          twitter_description?: string;
          twitter_image?: string;
          canonical_url?: string;
          alternate_urls?: Record<string, any>[];
          schema_markup?: Record<string, any>;
          robots_index?: boolean;
          robots_follow?: boolean;
          robots_meta?: string[];
          focus_keyword?: string;
          readability_score?: number;
          seo_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string[];
          og_title?: string;
          og_description?: string;
          og_image?: string;
          og_type?: string;
          twitter_card?: string;
          twitter_title?: string;
          twitter_description?: string;
          twitter_image?: string;
          canonical_url?: string;
          alternate_urls?: Record<string, any>[];
          schema_markup?: Record<string, any>;
          robots_index?: boolean;
          robots_follow?: boolean;
          robots_meta?: string[];
          focus_keyword?: string;
          readability_score?: number;
          seo_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          page_id: string;
          question: string;
          answer: string;
          sort_order: number;
          is_featured: boolean;
          schema_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          question: string;
          answer: string;
          sort_order?: number;
          is_featured?: boolean;
          schema_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          question?: string;
          answer?: string;
          sort_order?: number;
          is_featured?: boolean;
          schema_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_components: {
        Row: {
          id: string;
          page_id: string;
          component_type: string;
          component_data: Record<string, any>;
          section: 'header' | 'main' | 'sidebar' | 'footer';
          sort_order: number;
          is_visible: boolean;
          visibility_rules?: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          component_type: string;
          component_data: Record<string, any>;
          section: 'header' | 'main' | 'sidebar' | 'footer';
          sort_order?: number;
          is_visible?: boolean;
          visibility_rules?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          component_type?: string;
          component_data?: Record<string, any>;
          section?: 'header' | 'main' | 'sidebar' | 'footer';
          sort_order?: number;
          is_visible?: boolean;
          visibility_rules?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_revisions: {
        Row: {
          id: string;
          page_id: string;
          title: string;
          content: Record<string, any>;
          seo_snapshot?: Record<string, any>;
          revision_number: number;
          revision_message?: string;
          created_by?: string;
          created_at: string;
          is_auto_save: boolean;
          restored_from?: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          title: string;
          content: Record<string, any>;
          seo_snapshot?: Record<string, any>;
          revision_number: number;
          revision_message?: string;
          created_by?: string;
          created_at?: string;
          is_auto_save?: boolean;
          restored_from?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          title?: string;
          content?: Record<string, any>;
          seo_snapshot?: Record<string, any>;
          revision_number?: number;
          revision_message?: string;
          created_by?: string;
          created_at?: string;
          is_auto_save?: boolean;
          restored_from?: string;
        };
      };
    };
  };
}

// SQL Schema for Supabase
export const SUPABASE_SCHEMA = `
-- Create users table for session tracking and rate limiting
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  query_count INTEGER DEFAULT 0,
  last_query_at TIMESTAMPTZ
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on chats" ON chats FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
`;
