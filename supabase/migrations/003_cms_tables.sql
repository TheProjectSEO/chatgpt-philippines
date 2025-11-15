-- =====================================================
-- CMS Database Schema for WordPress-like functionality
-- =====================================================

-- =====================================================
-- 1. PAGES TABLE (Core content management)
-- =====================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  page_type TEXT NOT NULL CHECK (page_type IN ('tool', 'home', 'static', 'landing')),

  -- Content (JSONB for flexibility)
  content JSONB NOT NULL DEFAULT '{}',
  -- Example content structure:
  -- {
  --   "hero": {"title": "...", "subtitle": "...", "cta": "..."},
  --   "sections": [
  --     {"type": "features", "data": {...}},
  --     {"type": "faq", "data": {...}}
  --   ],
  --   "components": ["header", "footer", "sidebar"]
  -- }

  -- Status & Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,

  -- Author & Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Template & Layout
  template TEXT DEFAULT 'default',
  layout_config JSONB DEFAULT '{}',

  -- Featured Media
  featured_image UUID REFERENCES media(id) ON DELETE SET NULL,

  -- Analytics & Performance
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Flags
  is_homepage BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT false,
  is_indexable BOOLEAN DEFAULT true,

  -- Parent-child relationships (for nested pages)
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0
);

-- =====================================================
-- 2. SEO METADATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID UNIQUE REFERENCES pages(id) ON DELETE CASCADE,

  -- Meta Tags
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',

  -- Twitter Card
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Canonical & Alternate
  canonical_url TEXT,
  alternate_urls JSONB DEFAULT '[]',

  -- Schema.org (Structured Data)
  schema_markup JSONB DEFAULT '{}',
  -- Example: {"@type": "WebPage", "@context": "https://schema.org", ...}

  -- Robots
  robots_index BOOLEAN DEFAULT true,
  robots_follow BOOLEAN DEFAULT true,
  robots_meta TEXT[], -- ['noarchive', 'noimageindex', etc.]

  -- Additional
  focus_keyword TEXT,
  readability_score DECIMAL(3,1),
  seo_score DECIMAL(3,1),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. FAQs TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,

  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Ordering & Display
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,

  -- Schema.org FAQ
  schema_enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MEDIA LIBRARY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File Information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,

  -- File Metadata
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', 'audio'
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes

  -- Image-specific
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,

  -- Optimization
  is_optimized BOOLEAN DEFAULT false,
  optimization_data JSONB DEFAULT '{}',
  -- Example: {"original_size": 1024000, "optimized_size": 512000, "formats": ["webp", "avif"]}

  -- Thumbnails & Variants
  thumbnail_url TEXT,
  variants JSONB DEFAULT '[]',
  -- Example: [{"size": "small", "url": "...", "width": 300}, ...]

  -- Organization
  folder TEXT DEFAULT '/',
  tags TEXT[],

  -- Upload Information
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ
);

-- =====================================================
-- 5. PAGE COMPONENTS TABLE (For modular components)
-- =====================================================
CREATE TABLE IF NOT EXISTS page_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,

  -- Component Information
  component_type TEXT NOT NULL,
  -- Examples: 'hero', 'features', 'testimonials', 'pricing', 'cta', 'gallery'

  component_data JSONB NOT NULL DEFAULT '{}',
  -- Flexible schema for each component type

  -- Positioning
  section TEXT DEFAULT 'main', -- 'header', 'main', 'sidebar', 'footer'
  sort_order INTEGER DEFAULT 0,

  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  visibility_rules JSONB DEFAULT '{}',
  -- Example: {"device": ["desktop", "mobile"], "user_type": ["guest", "authenticated"]}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. PAGE REVISIONS TABLE (Version control)
-- =====================================================
CREATE TABLE IF NOT EXISTS page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,

  -- Snapshot of entire page state
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  seo_snapshot JSONB,

  -- Revision Information
  revision_number INTEGER NOT NULL,
  revision_message TEXT,

  -- Author
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Restoration tracking
  is_auto_save BOOLEAN DEFAULT false,
  restored_from UUID REFERENCES page_revisions(id),

  -- Unique constraint for page + revision number
  UNIQUE(page_id, revision_number)
);

-- =====================================================
-- 7. INTERNAL LINKS TABLE (Link management)
-- =====================================================
CREATE TABLE IF NOT EXISTS internal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  target_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,

  -- Link Information
  anchor_text TEXT NOT NULL,
  link_url TEXT NOT NULL,

  -- Positioning
  position_in_content INTEGER, -- character position or section index

  -- Link Type
  link_type TEXT DEFAULT 'contextual' CHECK (link_type IN ('contextual', 'navigation', 'footer', 'sidebar')),

  -- Tracking
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_broken BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate links
  UNIQUE(source_page_id, target_page_id, anchor_text)
);

-- =====================================================
-- 8. SCHEDULED PUBLISHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_publishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,

  scheduled_at TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('publish', 'unpublish', 'archive')),

  -- Execution tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  executed_at TIMESTAMPTZ,
  error_message TEXT,

  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. ADMIN USERS & PERMISSIONS (Extend existing users table)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Role-based access
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),

  -- Granular permissions
  can_create_pages BOOLEAN DEFAULT true,
  can_edit_pages BOOLEAN DEFAULT true,
  can_delete_pages BOOLEAN DEFAULT false,
  can_publish_pages BOOLEAN DEFAULT false,
  can_manage_seo BOOLEAN DEFAULT true,
  can_manage_media BOOLEAN DEFAULT true,
  can_manage_users BOOLEAN DEFAULT false,

  -- Restrictions
  allowed_page_types TEXT[] DEFAULT ARRAY['tool', 'static'],
  max_pages_per_day INTEGER DEFAULT 10,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Pages table indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_page_type ON pages(page_type);
CREATE INDEX idx_pages_published_at ON pages(published_at DESC);
CREATE INDEX idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX idx_pages_parent_id ON pages(parent_id);
CREATE INDEX idx_pages_is_homepage ON pages(is_homepage) WHERE is_homepage = true;

-- SEO metadata indexes
CREATE INDEX idx_seo_page_id ON seo_metadata(page_id);
CREATE INDEX idx_seo_focus_keyword ON seo_metadata(focus_keyword);

-- FAQs indexes
CREATE INDEX idx_faqs_page_id ON faqs(page_id);
CREATE INDEX idx_faqs_sort_order ON faqs(page_id, sort_order);
CREATE INDEX idx_faqs_featured ON faqs(is_featured) WHERE is_featured = true;

-- Media indexes
CREATE INDEX idx_media_file_type ON media(file_type);
CREATE INDEX idx_media_uploaded_at ON media(uploaded_at DESC);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_tags ON media USING GIN(tags);

-- Component indexes
CREATE INDEX idx_components_page_id ON page_components(page_id);
CREATE INDEX idx_components_type ON page_components(component_type);
CREATE INDEX idx_components_sort ON page_components(page_id, sort_order);

-- Revision indexes
CREATE INDEX idx_revisions_page_id ON page_revisions(page_id, revision_number DESC);
CREATE INDEX idx_revisions_created_at ON page_revisions(created_at DESC);

-- Internal links indexes
CREATE INDEX idx_links_source ON internal_links(source_page_id);
CREATE INDEX idx_links_target ON internal_links(target_page_id);
CREATE INDEX idx_links_broken ON internal_links(is_broken) WHERE is_broken = true;

-- Scheduled publishes indexes
CREATE INDEX idx_scheduled_status ON scheduled_publishes(status, scheduled_at);

-- Admin permissions indexes
CREATE INDEX idx_admin_user_id ON admin_permissions(user_id);
CREATE INDEX idx_admin_role ON admin_permissions(role);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_publishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  USING (status = 'published');

-- Authenticated users with admin permissions can do everything
CREATE POLICY "Admins have full access to pages"
  ON pages FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_permissions
      WHERE role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Public can view SEO metadata for published pages"
  ON seo_metadata FOR SELECT
  USING (
    page_id IN (SELECT id FROM pages WHERE status = 'published')
  );

CREATE POLICY "Admins have full access to SEO metadata"
  ON seo_metadata FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_permissions
      WHERE can_manage_seo = true
    )
  );

CREATE POLICY "Public can view FAQs for published pages"
  ON faqs FOR SELECT
  USING (
    page_id IN (SELECT id FROM pages WHERE status = 'published')
  );

CREATE POLICY "Admins have full access to FAQs"
  ON faqs FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_permissions
      WHERE role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Public can view media"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to media"
  ON media FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_permissions
      WHERE can_manage_media = true
    )
  );

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_updated_at BEFORE UPDATE ON seo_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON page_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON internal_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create revision on page update
CREATE OR REPLACE FUNCTION create_page_revision()
RETURNS TRIGGER AS $$
DECLARE
  next_revision_num INTEGER;
BEGIN
  -- Get next revision number
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO next_revision_num
  FROM page_revisions
  WHERE page_id = NEW.id;

  -- Create revision
  INSERT INTO page_revisions (
    page_id, title, content, revision_number, created_by, is_auto_save
  )
  VALUES (
    NEW.id, OLD.title, OLD.content, next_revision_num, NEW.updated_by, true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_revision_on_update
  AFTER UPDATE ON pages
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION create_page_revision();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Complete page view with all related data
CREATE OR REPLACE VIEW pages_complete AS
SELECT
  p.*,
  s.meta_title,
  s.meta_description,
  s.og_image,
  s.schema_markup,
  COALESCE(json_agg(DISTINCT f.*) FILTER (WHERE f.id IS NOT NULL), '[]') AS faqs,
  COALESCE(json_agg(DISTINCT pc.*) FILTER (WHERE pc.id IS NOT NULL), '[]') AS components,
  m.file_url AS featured_image_url,
  u1.session_id AS created_by_session,
  u2.session_id AS updated_by_session
FROM pages p
LEFT JOIN seo_metadata s ON p.id = s.page_id
LEFT JOIN faqs f ON p.id = f.page_id
LEFT JOIN page_components pc ON p.id = pc.page_id
LEFT JOIN media m ON p.featured_image = m.id
LEFT JOIN users u1 ON p.created_by = u1.id
LEFT JOIN users u2 ON p.updated_by = u2.id
GROUP BY p.id, s.id, m.file_url, u1.session_id, u2.session_id;

-- Admin dashboard stats view
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM pages) AS total_pages,
  (SELECT COUNT(*) FROM pages WHERE status = 'published') AS published_pages,
  (SELECT COUNT(*) FROM pages WHERE status = 'draft') AS draft_pages,
  (SELECT COUNT(*) FROM media) AS total_media,
  (SELECT SUM(file_size) FROM media) AS total_media_size,
  (SELECT COUNT(*) FROM admin_permissions) AS total_admins,
  (SELECT COUNT(*) FROM pages WHERE created_at > NOW() - INTERVAL '7 days') AS pages_this_week;

-- =====================================================
-- SAMPLE DATA INSERT (For testing)
-- =====================================================

-- Insert sample admin user (you'll need to replace with actual user_id from your users table)
-- INSERT INTO admin_permissions (user_id, role, can_delete_pages, can_publish_pages, can_manage_users)
-- VALUES ('your-user-uuid', 'super_admin', true, true, true);
