-- ============================================================================
-- SEO Configuration Table Schema for Supabase
-- ============================================================================
-- This script creates the complete database structure for the SEO meta
-- management system including tables, indexes, and Row Level Security policies.
-- ============================================================================

-- Create the seo_config table
CREATE TABLE IF NOT EXISTS seo_config (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Page Identification
  page_path TEXT UNIQUE NOT NULL,
  page_type TEXT NOT NULL,

  -- Core Meta Tags
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT[],

  -- Robots Directives
  robots_index BOOLEAN DEFAULT true NOT NULL,
  robots_follow BOOLEAN DEFAULT true NOT NULL,
  robots_advanced JSONB,

  -- URL Management
  canonical_url TEXT,

  -- Open Graph Meta Tags
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',

  -- Twitter Card Meta Tags
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Schema Markup
  schema_types TEXT[],
  schema_data JSONB,

  -- Management & Tracking
  priority INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by TEXT,

  -- Constraints
  CONSTRAINT valid_page_type CHECK (
    page_type IN (
      'home',
      'tool',
      'article',
      'faq',
      'landing',
      'category',
      'product',
      'about',
      'contact',
      'custom'
    )
  ),
  CONSTRAINT valid_og_type CHECK (
    og_type IN (
      'website',
      'article',
      'profile',
      'book',
      'video.movie',
      'video.episode',
      'video.tv_show',
      'video.other'
    )
  ),
  CONSTRAINT valid_twitter_card CHECK (
    twitter_card IN (
      'summary',
      'summary_large_image',
      'app',
      'player'
    )
  )
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

-- Index on page_path for fast lookups
CREATE INDEX IF NOT EXISTS idx_seo_config_page_path
  ON seo_config(page_path);

-- Index on page_type for filtering by type
CREATE INDEX IF NOT EXISTS idx_seo_config_page_type
  ON seo_config(page_type);

-- Index on priority for ordering
CREATE INDEX IF NOT EXISTS idx_seo_config_priority
  ON seo_config(priority DESC);

-- Index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_seo_config_created_at
  ON seo_config(created_at DESC);

-- Full-text search index on title and description
CREATE INDEX IF NOT EXISTS idx_seo_config_search
  ON seo_config USING gin(
    to_tsvector('english', title || ' ' || description)
  );

-- ============================================================================
-- Create Trigger for Updated At Timestamp
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_seo_config_updated_at ON seo_config;
CREATE TRIGGER update_seo_config_updated_at
  BEFORE UPDATE ON seo_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Create RLS Policies
-- ============================================================================

-- Policy: Allow everyone to read SEO configurations (public access)
DROP POLICY IF EXISTS "Allow public read access" ON seo_config;
CREATE POLICY "Allow public read access"
  ON seo_config
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert
DROP POLICY IF EXISTS "Allow authenticated insert" ON seo_config;
CREATE POLICY "Allow authenticated insert"
  ON seo_config
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update
DROP POLICY IF EXISTS "Allow authenticated update" ON seo_config;
CREATE POLICY "Allow authenticated update"
  ON seo_config
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete
DROP POLICY IF EXISTS "Allow authenticated delete" ON seo_config;
CREATE POLICY "Allow authenticated delete"
  ON seo_config
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Insert Default SEO Configurations
-- ============================================================================

-- Home page default SEO
INSERT INTO seo_config (
  page_path,
  page_type,
  title,
  description,
  keywords,
  canonical_url,
  og_title,
  og_description,
  og_type,
  priority
) VALUES (
  '/',
  'home',
  'Free ChatGPT Philippines - AI Chat, Generator & Tools',
  'Free ChatGPT Philippines powered by Claude AI. Image generator, translator, detector, character AI, plagiarism checker, and more AI tools for Filipino users.',
  ARRAY['ChatGPT Philippines', 'free AI chat', 'AI tools Philippines', 'Filipino AI'],
  'https://chatgpt-philippines.com',
  'Free ChatGPT Philippines - AI Chat, Generator & Tools',
  'Free AI-powered tools for Filipinos: chat, generate images, translate, check plagiarism, and more.',
  'website',
  100
) ON CONFLICT (page_path) DO NOTHING;

-- Paraphraser tool default SEO
INSERT INTO seo_config (
  page_path,
  page_type,
  title,
  description,
  keywords,
  canonical_url,
  og_title,
  og_description,
  og_type,
  twitter_card,
  priority
) VALUES (
  '/paraphraser',
  'tool',
  'Free Paraphrasing Tool - Rewrite Text Online',
  'Rewrite text while preserving meaning with our free AI paraphrasing tool. Perfect for avoiding plagiarism, improving clarity, and creating unique content. 4 rewrite modes available.',
  ARRAY['paraphrasing tool', 'paraphrase generator', 'rewrite text', 'free paraphraser'],
  'https://chatgpt-philippines.com/paraphraser',
  'Free Paraphrasing Tool - Rewrite Text Instantly',
  'AI-powered paraphrasing tool with 4 rewrite modes. Create unique, plagiarism-free content in seconds.',
  'website',
  'summary_large_image',
  90
) ON CONFLICT (page_path) DO NOTHING;

-- Grammar Checker tool default SEO
INSERT INTO seo_config (
  page_path,
  page_type,
  title,
  description,
  keywords,
  canonical_url,
  priority
) VALUES (
  '/grammar-checker',
  'tool',
  'Free Grammar Checker - Fix Writing Errors Online',
  'Check and fix grammar, spelling, and punctuation errors instantly. Free AI-powered grammar checker for English and Tagalog. Improve your writing quality.',
  ARRAY['grammar checker', 'spell check', 'writing tool', 'free grammar check'],
  'https://chatgpt-philippines.com/grammar-checker',
  90
) ON CONFLICT (page_path) DO NOTHING;

-- AI Chat tool default SEO
INSERT INTO seo_config (
  page_path,
  page_type,
  title,
  description,
  keywords,
  canonical_url,
  priority
) VALUES (
  '/chat',
  'tool',
  'Free AI Chat - ChatGPT Philippines',
  'Chat with AI for free in English or Tagalog. Get instant answers, creative ideas, and help with tasks. Powered by Claude AI.',
  ARRAY['AI chat', 'free ChatGPT', 'chat Philippines', 'Tagalog AI'],
  'https://chatgpt-philippines.com/chat',
  95
) ON CONFLICT (page_path) DO NOTHING;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to search SEO configs by text
CREATE OR REPLACE FUNCTION search_seo_configs(search_query TEXT)
RETURNS TABLE (
  id UUID,
  page_path TEXT,
  page_type TEXT,
  title TEXT,
  description TEXT,
  priority INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.page_path,
    sc.page_type,
    sc.title,
    sc.description,
    sc.priority,
    ts_rank(
      to_tsvector('english', sc.title || ' ' || sc.description),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM seo_config sc
  WHERE
    to_tsvector('english', sc.title || ' ' || sc.description) @@
    plainto_tsquery('english', search_query)
  ORDER BY rank DESC, sc.priority DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get SEO configs by page type
CREATE OR REPLACE FUNCTION get_seo_configs_by_type(p_page_type TEXT)
RETURNS TABLE (
  id UUID,
  page_path TEXT,
  title TEXT,
  description TEXT,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.page_path,
    sc.title,
    sc.description,
    sc.priority
  FROM seo_config sc
  WHERE sc.page_type = p_page_type
  ORDER BY sc.priority DESC, sc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE seo_config IS 'Stores SEO metadata configuration for all pages';
COMMENT ON COLUMN seo_config.page_path IS 'Unique path identifier for the page (e.g., /paraphraser)';
COMMENT ON COLUMN seo_config.page_type IS 'Type of page for categorization and default schema selection';
COMMENT ON COLUMN seo_config.title IS 'SEO title tag (recommended 50-60 characters)';
COMMENT ON COLUMN seo_config.description IS 'Meta description (recommended 120-160 characters)';
COMMENT ON COLUMN seo_config.keywords IS 'Array of SEO keywords (recommended 5-10)';
COMMENT ON COLUMN seo_config.robots_index IS 'Allow search engines to index this page';
COMMENT ON COLUMN seo_config.robots_follow IS 'Allow search engines to follow links on this page';
COMMENT ON COLUMN seo_config.robots_advanced IS 'Advanced robots directives as JSON';
COMMENT ON COLUMN seo_config.canonical_url IS 'Canonical URL to prevent duplicate content issues';
COMMENT ON COLUMN seo_config.schema_data IS 'JSON-LD schema markup for the page';
COMMENT ON COLUMN seo_config.priority IS 'Priority for ordering (higher = more important)';

-- ============================================================================
-- Grant Permissions (if needed)
-- ============================================================================

-- Grant usage on the table to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON seo_config TO anon;
GRANT ALL ON seo_config TO authenticated;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify table structure
-- SELECT * FROM information_schema.columns WHERE table_name = 'seo_config';

-- Verify indexes
-- SELECT * FROM pg_indexes WHERE tablename = 'seo_config';

-- Verify RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'seo_config';

-- Test search function
-- SELECT * FROM search_seo_configs('paraphrase');

-- ============================================================================
-- End of Schema
-- ============================================================================
