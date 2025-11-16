-- ============================================================================
-- Enhanced SEO Configuration Schema
-- ============================================================================
-- Comprehensive SEO management system with full metadata, schema markup,
-- robots.txt, and sitemap management capabilities.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SEO Configuration Table (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_metadata (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Page Identification
  page_path TEXT UNIQUE NOT NULL,
  page_type TEXT NOT NULL,
  page_title TEXT NOT NULL, -- Actual page title for reference

  -- Core Meta Tags
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],

  -- Robots Directives
  robots_index BOOLEAN DEFAULT true NOT NULL,
  robots_follow BOOLEAN DEFAULT true NOT NULL,
  robots_noarchive BOOLEAN DEFAULT false,
  robots_nosnippet BOOLEAN DEFAULT false,
  robots_noimageindex BOOLEAN DEFAULT false,
  robots_max_snippet INTEGER DEFAULT -1,
  robots_max_image_preview TEXT DEFAULT 'large',
  robots_max_video_preview INTEGER DEFAULT -1,

  -- URL Management
  canonical_url TEXT,

  -- Alternate Links (for multi-language/region)
  alternate_links JSONB DEFAULT '[]'::jsonb,

  -- Open Graph Meta Tags
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_image_width INTEGER DEFAULT 1200,
  og_image_height INTEGER DEFAULT 630,
  og_image_alt TEXT,
  og_type TEXT DEFAULT 'website',
  og_url TEXT,
  og_site_name TEXT,
  og_locale TEXT DEFAULT 'en_PH',

  -- Open Graph Article (if applicable)
  og_article_published_time TIMESTAMP WITH TIME ZONE,
  og_article_modified_time TIMESTAMP WITH TIME ZONE,
  og_article_author TEXT,
  og_article_section TEXT,
  og_article_tags TEXT[],

  -- Twitter Card Meta Tags
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_site TEXT,
  twitter_creator TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  twitter_image_alt TEXT,

  -- Schema Markup (JSON-LD)
  schema_enabled BOOLEAN DEFAULT true,
  schema_types TEXT[], -- e.g., ['WebPage', 'Article', 'Organization']
  schema_data JSONB DEFAULT '{}'::jsonb,

  -- Custom Schema Markup (for manual overrides)
  custom_schema JSONB,

  -- Additional Meta Tags
  author TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  modified_date TIMESTAMP WITH TIME ZONE,
  section TEXT,
  tags TEXT[],

  -- SEO Score & Status
  seo_score INTEGER DEFAULT 0,
  seo_issues JSONB DEFAULT '[]'::jsonb,
  seo_warnings JSONB DEFAULT '[]'::jsonb,

  -- Management & Tracking
  priority INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by TEXT,
  updated_by TEXT,

  -- Constraints
  CONSTRAINT valid_page_type CHECK (
    page_type IN (
      'home', 'tool', 'article', 'faq', 'landing',
      'category', 'product', 'about', 'contact', 'custom'
    )
  ),
  CONSTRAINT valid_og_type CHECK (
    og_type IN (
      'website', 'article', 'profile', 'book',
      'video.movie', 'video.episode', 'video.tv_show', 'video.other'
    )
  ),
  CONSTRAINT valid_twitter_card CHECK (
    twitter_card IN (
      'summary', 'summary_large_image', 'app', 'player'
    )
  ),
  CONSTRAINT valid_robots_max_image_preview CHECK (
    robots_max_image_preview IN ('none', 'standard', 'large')
  ),
  CONSTRAINT valid_seo_score CHECK (
    seo_score >= 0 AND seo_score <= 100
  )
);

-- ============================================================================
-- Robots.txt Management Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS robots_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content
  content TEXT NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Management
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by TEXT,
  updated_by TEXT,

  -- Notes
  change_notes TEXT
);

-- ============================================================================
-- Sitemap Configuration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS sitemap_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Page Information
  page_path TEXT UNIQUE NOT NULL,

  -- Sitemap Settings
  include_in_sitemap BOOLEAN DEFAULT true,
  priority DECIMAL(2,1) DEFAULT 0.5,
  changefreq TEXT DEFAULT 'weekly',
  last_modified TIMESTAMP WITH TIME ZONE,

  -- Management
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_priority CHECK (
    priority >= 0.0 AND priority <= 1.0
  ),
  CONSTRAINT valid_changefreq CHECK (
    changefreq IN (
      'always', 'hourly', 'daily', 'weekly',
      'monthly', 'yearly', 'never'
    )
  )
);

-- ============================================================================
-- SEO Redirects Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_redirects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Redirect Configuration
  from_path TEXT NOT NULL,
  to_path TEXT NOT NULL,
  redirect_type INTEGER DEFAULT 301, -- 301 permanent, 302 temporary

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Analytics
  hit_count INTEGER DEFAULT 0,
  last_hit TIMESTAMP WITH TIME ZONE,

  -- Management
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by TEXT,
  notes TEXT,

  -- Constraints
  CONSTRAINT valid_redirect_type CHECK (
    redirect_type IN (301, 302, 307, 308)
  ),
  CONSTRAINT different_paths CHECK (
    from_path != to_path
  )
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

-- SEO Metadata Indexes
CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_path
  ON seo_metadata(page_path);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_type
  ON seo_metadata(page_type);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_priority
  ON seo_metadata(priority DESC);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_created_at
  ON seo_metadata(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_active
  ON seo_metadata(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_seo_metadata_seo_score
  ON seo_metadata(seo_score DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_seo_metadata_search
  ON seo_metadata USING gin(
    to_tsvector('english',
      COALESCE(page_title, '') || ' ' ||
      COALESCE(meta_title, '') || ' ' ||
      COALESCE(meta_description, '')
    )
  );

-- Schema data index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_seo_metadata_schema_data
  ON seo_metadata USING gin(schema_data);

-- Sitemap Config Indexes
CREATE INDEX IF NOT EXISTS idx_sitemap_config_page_path
  ON sitemap_config(page_path);

CREATE INDEX IF NOT EXISTS idx_sitemap_config_include
  ON sitemap_config(include_in_sitemap) WHERE include_in_sitemap = true;

CREATE INDEX IF NOT EXISTS idx_sitemap_config_priority
  ON sitemap_config(priority DESC);

-- Redirects Indexes
CREATE INDEX IF NOT EXISTS idx_seo_redirects_from_path
  ON seo_redirects(from_path) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_seo_redirects_active
  ON seo_redirects(is_active) WHERE is_active = true;

-- ============================================================================
-- Create Triggers for Auto-Update Timestamps
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for seo_metadata
DROP TRIGGER IF EXISTS update_seo_metadata_updated_at ON seo_metadata;
CREATE TRIGGER update_seo_metadata_updated_at
  BEFORE UPDATE ON seo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for robots_config
DROP TRIGGER IF EXISTS update_robots_config_updated_at ON robots_config;
CREATE TRIGGER update_robots_config_updated_at
  BEFORE UPDATE ON robots_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sitemap_config
DROP TRIGGER IF EXISTS update_sitemap_config_updated_at ON sitemap_config;
CREATE TRIGGER update_sitemap_config_updated_at
  BEFORE UPDATE ON sitemap_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for seo_redirects
DROP TRIGGER IF EXISTS update_seo_redirects_updated_at ON seo_redirects;
CREATE TRIGGER update_seo_redirects_updated_at
  BEFORE UPDATE ON seo_redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_redirects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Create RLS Policies
-- ============================================================================

-- SEO Metadata Policies
DROP POLICY IF EXISTS "Allow public read access" ON seo_metadata;
CREATE POLICY "Allow public read access"
  ON seo_metadata FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON seo_metadata;
CREATE POLICY "Allow authenticated insert"
  ON seo_metadata FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON seo_metadata;
CREATE POLICY "Allow authenticated update"
  ON seo_metadata FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON seo_metadata;
CREATE POLICY "Allow authenticated delete"
  ON seo_metadata FOR DELETE
  USING (auth.role() = 'authenticated');

-- Robots Config Policies
DROP POLICY IF EXISTS "Allow public read access" ON robots_config;
CREATE POLICY "Allow public read access"
  ON robots_config FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated manage" ON robots_config;
CREATE POLICY "Allow authenticated manage"
  ON robots_config FOR ALL
  USING (auth.role() = 'authenticated');

-- Sitemap Config Policies
DROP POLICY IF EXISTS "Allow public read access" ON sitemap_config;
CREATE POLICY "Allow public read access"
  ON sitemap_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage" ON sitemap_config;
CREATE POLICY "Allow authenticated manage"
  ON sitemap_config FOR ALL
  USING (auth.role() = 'authenticated');

-- Redirects Policies
DROP POLICY IF EXISTS "Allow public read access" ON seo_redirects;
CREATE POLICY "Allow public read access"
  ON seo_redirects FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated manage" ON seo_redirects;
CREATE POLICY "Allow authenticated manage"
  ON seo_redirects FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to calculate SEO score
CREATE OR REPLACE FUNCTION calculate_seo_score(metadata_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  rec RECORD;
BEGIN
  SELECT * INTO rec FROM seo_metadata WHERE id = metadata_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Meta title check (20 points)
  IF LENGTH(rec.meta_title) >= 50 AND LENGTH(rec.meta_title) <= 60 THEN
    score := score + 20;
  ELSIF LENGTH(rec.meta_title) > 0 THEN
    score := score + 10;
  END IF;

  -- Meta description check (20 points)
  IF LENGTH(rec.meta_description) >= 150 AND LENGTH(rec.meta_description) <= 160 THEN
    score := score + 20;
  ELSIF LENGTH(rec.meta_description) > 0 THEN
    score := score + 10;
  END IF;

  -- Keywords check (10 points)
  IF array_length(rec.meta_keywords, 1) >= 3 THEN
    score := score + 10;
  ELSIF array_length(rec.meta_keywords, 1) > 0 THEN
    score := score + 5;
  END IF;

  -- Open Graph check (15 points)
  IF rec.og_title IS NOT NULL AND rec.og_description IS NOT NULL AND rec.og_image IS NOT NULL THEN
    score := score + 15;
  ELSIF rec.og_title IS NOT NULL OR rec.og_description IS NOT NULL THEN
    score := score + 7;
  END IF;

  -- Twitter Card check (10 points)
  IF rec.twitter_title IS NOT NULL AND rec.twitter_description IS NOT NULL AND rec.twitter_image IS NOT NULL THEN
    score := score + 10;
  ELSIF rec.twitter_title IS NOT NULL OR rec.twitter_description IS NOT NULL THEN
    score := score + 5;
  END IF;

  -- Schema markup check (15 points)
  IF rec.schema_enabled AND rec.schema_data IS NOT NULL AND jsonb_typeof(rec.schema_data) = 'object' THEN
    score := score + 15;
  END IF;

  -- Canonical URL check (5 points)
  IF rec.canonical_url IS NOT NULL THEN
    score := score + 5;
  END IF;

  -- Robots configuration check (5 points)
  IF rec.robots_index = true AND rec.robots_follow = true THEN
    score := score + 5;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to search SEO metadata
CREATE OR REPLACE FUNCTION search_seo_metadata(search_query TEXT)
RETURNS TABLE (
  id UUID,
  page_path TEXT,
  page_type TEXT,
  page_title TEXT,
  meta_title TEXT,
  meta_description TEXT,
  seo_score INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sm.id,
    sm.page_path,
    sm.page_type,
    sm.page_title,
    sm.meta_title,
    sm.meta_description,
    sm.seo_score,
    ts_rank(
      to_tsvector('english',
        COALESCE(sm.page_title, '') || ' ' ||
        COALESCE(sm.meta_title, '') || ' ' ||
        COALESCE(sm.meta_description, '')
      ),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM seo_metadata sm
  WHERE
    sm.is_active = true
    AND to_tsvector('english',
      COALESCE(sm.page_title, '') || ' ' ||
      COALESCE(sm.meta_title, '') || ' ' ||
      COALESCE(sm.meta_description, '')
    ) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, sm.priority DESC, sm.seo_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get active robots.txt
CREATE OR REPLACE FUNCTION get_active_robots_txt()
RETURNS TEXT AS $$
DECLARE
  robots_content TEXT;
BEGIN
  SELECT content INTO robots_content
  FROM robots_config
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(robots_content, '');
END;
$$ LANGUAGE plpgsql;

-- Function to get sitemap entries
CREATE OR REPLACE FUNCTION get_sitemap_entries()
RETURNS TABLE (
  page_path TEXT,
  priority DECIMAL,
  changefreq TEXT,
  last_modified TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.page_path,
    sc.priority,
    sc.changefreq,
    COALESCE(sc.last_modified, sc.updated_at) AS last_modified
  FROM sitemap_config sc
  WHERE sc.include_in_sitemap = true
  ORDER BY sc.priority DESC, sc.page_path ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to track redirect hits
CREATE OR REPLACE FUNCTION track_redirect_hit(p_from_path TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE seo_redirects
  SET
    hit_count = hit_count + 1,
    last_hit = NOW()
  WHERE from_path = p_from_path AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Insert Default Configurations
-- ============================================================================

-- Default robots.txt
INSERT INTO robots_config (content, is_active, version, change_notes)
VALUES (
  '# Robots.txt for ChatGPT Philippines
# Generated by SEO Management System

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Sitemaps
Sitemap: https://chatgpt-philippines.com/sitemap.xml
Sitemap: https://chatgpt-philippines.com/sitemap-tools.xml
Sitemap: https://chatgpt-philippines.com/sitemap-articles.xml',
  true,
  1,
  'Initial robots.txt configuration'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON seo_metadata TO anon;
GRANT ALL ON seo_metadata TO authenticated;
GRANT SELECT ON robots_config TO anon;
GRANT ALL ON robots_config TO authenticated;
GRANT SELECT ON sitemap_config TO anon;
GRANT ALL ON sitemap_config TO authenticated;
GRANT SELECT ON seo_redirects TO anon;
GRANT ALL ON seo_redirects TO authenticated;

-- ============================================================================
-- Table Comments
-- ============================================================================

COMMENT ON TABLE seo_metadata IS 'Comprehensive SEO metadata for all pages';
COMMENT ON TABLE robots_config IS 'Robots.txt configuration with versioning';
COMMENT ON TABLE sitemap_config IS 'Sitemap configuration for each page';
COMMENT ON TABLE seo_redirects IS 'SEO-friendly URL redirects with tracking';

COMMENT ON COLUMN seo_metadata.seo_score IS 'Calculated SEO score (0-100) based on completeness';
COMMENT ON COLUMN seo_metadata.schema_data IS 'JSON-LD schema markup data';
COMMENT ON COLUMN sitemap_config.priority IS 'Sitemap priority (0.0 to 1.0)';
COMMENT ON COLUMN sitemap_config.changefreq IS 'How frequently the page changes';

-- ============================================================================
-- End of Enhanced SEO Schema
-- ============================================================================
