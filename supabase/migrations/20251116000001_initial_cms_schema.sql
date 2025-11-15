-- ================================================
-- CMS DATABASE SCHEMA FOR NEXT.JS + SUPABASE
-- Production-ready schema with versioning, SEO, and content management
-- Migration: 20251116000001_initial_cms_schema.sql
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- Purpose: Store CMS user profiles with roles and permissions
-- ================================================
CREATE TABLE IF NOT EXISTS public.cms_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE, -- Links to auth.users
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'editor', -- admin, editor, viewer
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cms_users_auth_user_id ON public.cms_users(auth_user_id);
CREATE INDEX idx_cms_users_role ON public.cms_users(role);
CREATE INDEX idx_cms_users_is_active ON public.cms_users(is_active);

COMMENT ON TABLE public.cms_users IS 'CMS user profiles extending Supabase auth with roles and permissions';
COMMENT ON COLUMN public.cms_users.role IS 'User role: admin (full access), editor (create/edit), viewer (read-only)';

-- ================================================
-- 2. PAGE TYPES TABLE
-- Purpose: Define different types of pages (tool_page, blog_post, etc.)
-- ================================================
CREATE TABLE IF NOT EXISTS public.page_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 'tool_page', 'home_page', 'static_page', 'blog_post'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    template_schema JSONB, -- Defines the structure/fields for this page type
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_types_name ON public.page_types(name);
CREATE INDEX idx_page_types_is_active ON public.page_types(is_active);

COMMENT ON TABLE public.page_types IS 'Page type definitions for different content types in the CMS';
COMMENT ON COLUMN public.page_types.template_schema IS 'JSONB schema defining fields and structure for this page type';

-- ================================================
-- 3. PAGES TABLE (Main content pages)
-- Purpose: Store all pages with versioning and workflow states
-- ================================================
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type_id UUID NOT NULL REFERENCES public.page_types(id) ON DELETE RESTRICT,
    slug VARCHAR(255) NOT NULL UNIQUE, -- URL slug (e.g., 'paraphrase', 'essay-writer')
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, archived, scheduled
    published_at TIMESTAMPTZ,
    scheduled_publish_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    parent_page_id UUID, -- For versioning - points to original page
    created_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Composite unique constraint for slug + current version
    CONSTRAINT unique_current_slug UNIQUE NULLS NOT DISTINCT (slug, is_current_version)
);

-- Strategic indexes for performance
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_status ON public.pages(status);
CREATE INDEX idx_pages_page_type_id ON public.pages(page_type_id);
CREATE INDEX idx_pages_parent_page_id ON public.pages(parent_page_id);
CREATE INDEX idx_pages_published_at ON public.pages(published_at DESC);
CREATE INDEX idx_pages_is_current_version ON public.pages(is_current_version) WHERE is_current_version = true;
CREATE INDEX idx_pages_scheduled_publish ON public.pages(scheduled_publish_at) WHERE status = 'scheduled';

COMMENT ON TABLE public.pages IS 'Main pages table storing all content pages with versioning support';
COMMENT ON COLUMN public.pages.status IS 'Page status: draft (editing), published (live), archived (hidden), scheduled (future publish)';
COMMENT ON COLUMN public.pages.is_current_version IS 'Flag to indicate the current active version of the page';

-- ================================================
-- 4. SEO META TABLE
-- Purpose: Store SEO metadata, Open Graph, and Twitter Card data
-- ================================================
CREATE TABLE IF NOT EXISTS public.seo_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    meta_title VARCHAR(70), -- Recommended 50-60 chars
    meta_description VARCHAR(160), -- Recommended 150-160 chars
    og_title VARCHAR(95), -- Open Graph title
    og_description VARCHAR(200), -- Open Graph description
    og_image TEXT, -- URL to OG image
    og_type VARCHAR(50) DEFAULT 'website', -- website, article, etc.
    twitter_card VARCHAR(50) DEFAULT 'summary_large_image', -- summary, summary_large_image
    twitter_title VARCHAR(70),
    twitter_description VARCHAR(200),
    twitter_image TEXT,
    canonical_url TEXT, -- Canonical URL for this page
    robots VARCHAR(100) DEFAULT 'index, follow', -- index, follow, noindex, nofollow
    keywords TEXT[], -- Array of keywords
    author VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    additional_meta JSONB, -- For custom meta tags
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_page_seo UNIQUE(page_id)
);

CREATE INDEX idx_seo_meta_page_id ON public.seo_meta(page_id);
CREATE INDEX idx_seo_meta_keywords ON public.seo_meta USING GIN(keywords);

COMMENT ON TABLE public.seo_meta IS 'SEO metadata for each page including Open Graph and Twitter Card data';
COMMENT ON COLUMN public.seo_meta.meta_title IS 'SEO title tag (recommended 50-60 characters for optimal display)';
COMMENT ON COLUMN public.seo_meta.meta_description IS 'SEO meta description (recommended 150-160 characters)';

-- ================================================
-- 5. SCHEMA MARKUP TABLE (JSON-LD)
-- Purpose: Store structured data schemas for SEO
-- ================================================
CREATE TABLE IF NOT EXISTS public.schema_markup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    schema_type VARCHAR(100) NOT NULL, -- Article, WebPage, FAQPage, Organization, Product, etc.
    schema_data JSONB NOT NULL, -- The actual JSON-LD schema
    priority INTEGER DEFAULT 0, -- For ordering multiple schemas on same page
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schema_markup_page_id ON public.schema_markup(page_id);
CREATE INDEX idx_schema_markup_schema_type ON public.schema_markup(schema_type);
CREATE INDEX idx_schema_markup_priority ON public.schema_markup(page_id, priority);

COMMENT ON TABLE public.schema_markup IS 'JSON-LD structured data schemas for SEO';
COMMENT ON COLUMN public.schema_markup.schema_data IS 'Full JSON-LD schema object conforming to schema.org standards';

-- ================================================
-- 6. PAGE CONTENT BLOCKS TABLE
-- Purpose: Flexible content blocks for building pages
-- ================================================
CREATE TABLE IF NOT EXISTS public.page_content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    block_type VARCHAR(100) NOT NULL, -- hero, text, image, video, cta, faq, testimonial, etc.
    block_data JSONB NOT NULL, -- Flexible content for each block type
    position INTEGER NOT NULL DEFAULT 0, -- Order of blocks on page
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_content_blocks_page_id ON public.page_content_blocks(page_id);
CREATE INDEX idx_page_content_blocks_position ON public.page_content_blocks(page_id, position);
CREATE INDEX idx_page_content_blocks_type ON public.page_content_blocks(block_type);
CREATE INDEX idx_page_content_blocks_active ON public.page_content_blocks(page_id, is_active) WHERE is_active = true;

COMMENT ON TABLE public.page_content_blocks IS 'Flexible content blocks for building pages (supports WYSIWYG editing)';
COMMENT ON COLUMN public.page_content_blocks.block_data IS 'JSONB field storing block-specific content and configuration';

-- ================================================
-- 7. FAQS TABLE
-- Purpose: Store FAQ items for pages with FAQPage schema support
-- ================================================
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER DEFAULT 0, -- Order of FAQs
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(100), -- Optional categorization
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faqs_page_id ON public.faqs(page_id);
CREATE INDEX idx_faqs_position ON public.faqs(page_id, position);
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_active ON public.faqs(page_id, is_active) WHERE is_active = true;

COMMENT ON TABLE public.faqs IS 'FAQ items linked to pages with FAQPage schema support';

-- ================================================
-- 8. MEDIA LIBRARY TABLE
-- Purpose: Centralized media storage with metadata
-- ================================================
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_url TEXT NOT NULL, -- Public URL
    file_type VARCHAR(50) NOT NULL, -- image/jpeg, image/png, video/mp4, etc.
    mime_type VARCHAR(100),
    file_size BIGINT, -- Size in bytes
    width INTEGER, -- For images
    height INTEGER, -- For images
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    tags TEXT[], -- Array of tags for searching
    uploaded_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    storage_provider VARCHAR(50) DEFAULT 'supabase', -- supabase, cloudinary, s3
    metadata JSONB, -- Additional metadata (EXIF, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_library_file_type ON public.media_library(file_type);
CREATE INDEX idx_media_library_uploaded_by ON public.media_library(uploaded_by);
CREATE INDEX idx_media_library_tags ON public.media_library USING GIN(tags);
CREATE INDEX idx_media_library_created_at ON public.media_library(created_at DESC);
CREATE INDEX idx_media_library_file_name ON public.media_library(file_name);

COMMENT ON TABLE public.media_library IS 'Centralized media storage with metadata and tagging';

-- ================================================
-- 9. INTERNAL LINKS TABLE
-- Purpose: Track internal linking structure for SEO
-- ================================================
CREATE TABLE IF NOT EXISTS public.internal_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    anchor_text TEXT NOT NULL,
    link_context TEXT, -- Surrounding text for context
    link_type VARCHAR(50) DEFAULT 'contextual', -- contextual, navigational, recommended
    position INTEGER, -- Position on source page
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0, -- Track link performance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate links between same pages with same anchor
    CONSTRAINT unique_internal_link UNIQUE(source_page_id, target_page_id, anchor_text)
);

CREATE INDEX idx_internal_links_source_page_id ON public.internal_links(source_page_id);
CREATE INDEX idx_internal_links_target_page_id ON public.internal_links(target_page_id);
CREATE INDEX idx_internal_links_link_type ON public.internal_links(link_type);
CREATE INDEX idx_internal_links_active ON public.internal_links(is_active) WHERE is_active = true;

COMMENT ON TABLE public.internal_links IS 'Internal linking structure between pages for SEO and navigation';

-- ================================================
-- 10. PAGE VERSIONS TABLE (Audit Trail)
-- Purpose: Store full history of page changes
-- ================================================
CREATE TABLE IF NOT EXISTS public.page_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_snapshot JSONB NOT NULL, -- Full snapshot of page content
    seo_snapshot JSONB, -- SEO meta at this version
    change_summary TEXT, -- Description of changes
    changed_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_page_version UNIQUE(page_id, version_number)
);

CREATE INDEX idx_page_versions_page_id ON public.page_versions(page_id);
CREATE INDEX idx_page_versions_created_at ON public.page_versions(created_at DESC);
CREATE INDEX idx_page_versions_version_number ON public.page_versions(page_id, version_number DESC);

COMMENT ON TABLE public.page_versions IS 'Audit trail of all page changes with full snapshots for rollback';

-- ================================================
-- 11. CATEGORIES TABLE (For organizing tools/pages)
-- Purpose: Hierarchical categorization system
-- ================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon VARCHAR(100), -- Icon name or URL
    color VARCHAR(7), -- Hex color code
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_position ON public.categories(position);
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = true;

COMMENT ON TABLE public.categories IS 'Hierarchical category system for organizing pages and content';

-- ================================================
-- 12. PAGE CATEGORIES (Many-to-Many Junction)
-- Purpose: Link pages to multiple categories
-- ================================================
CREATE TABLE IF NOT EXISTS public.page_categories (
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (page_id, category_id)
);

CREATE INDEX idx_page_categories_page_id ON public.page_categories(page_id);
CREATE INDEX idx_page_categories_category_id ON public.page_categories(category_id);

COMMENT ON TABLE public.page_categories IS 'Many-to-many junction table linking pages to categories';

-- ================================================
-- 13. CONTENT TAGS TABLE
-- Purpose: Tag definitions for content organization
-- ================================================
CREATE TABLE IF NOT EXISTS public.content_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_tags_slug ON public.content_tags(slug);
CREATE INDEX idx_content_tags_usage_count ON public.content_tags(usage_count DESC);
CREATE INDEX idx_content_tags_active ON public.content_tags(is_active) WHERE is_active = true;

COMMENT ON TABLE public.content_tags IS 'Tag definitions for content organization and filtering';

-- ================================================
-- 14. PAGE TAGS (Many-to-Many Junction)
-- Purpose: Link pages to multiple tags
-- ================================================
CREATE TABLE IF NOT EXISTS public.page_tags (
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (page_id, tag_id)
);

CREATE INDEX idx_page_tags_page_id ON public.page_tags(page_id);
CREATE INDEX idx_page_tags_tag_id ON public.page_tags(tag_id);

COMMENT ON TABLE public.page_tags IS 'Many-to-many junction table linking pages to tags';

-- ================================================
-- 15. REDIRECTS TABLE (For URL management)
-- Purpose: Manage URL redirects for SEO
-- ================================================
CREATE TABLE IF NOT EXISTS public.redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_path VARCHAR(500) NOT NULL UNIQUE,
    to_path VARCHAR(500) NOT NULL,
    redirect_type INTEGER DEFAULT 301, -- 301 permanent, 302 temporary
    is_active BOOLEAN DEFAULT true,
    hit_count INTEGER DEFAULT 0, -- Track redirect usage
    created_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redirects_from_path ON public.redirects(from_path);
CREATE INDEX idx_redirects_is_active ON public.redirects(is_active) WHERE is_active = true;
CREATE INDEX idx_redirects_hit_count ON public.redirects(hit_count DESC);

COMMENT ON TABLE public.redirects IS 'URL redirect management for SEO and URL structure changes';

-- ================================================
-- 16. PAGE ANALYTICS TABLE (Basic page analytics)
-- Purpose: Track page performance metrics
-- ================================================
CREATE TABLE IF NOT EXISTS public.page_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTEGER, -- Seconds
    bounce_rate DECIMAL(5,2), -- Percentage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_page_analytics_date UNIQUE(page_id, date)
);

CREATE INDEX idx_page_analytics_page_id ON public.page_analytics(page_id);
CREATE INDEX idx_page_analytics_date ON public.page_analytics(date DESC);
CREATE INDEX idx_page_analytics_page_date ON public.page_analytics(page_id, date DESC);

COMMENT ON TABLE public.page_analytics IS 'Daily page analytics for tracking performance and engagement';

-- ================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_cms_users_updated_at BEFORE UPDATE ON public.cms_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_types_updated_at BEFORE UPDATE ON public.page_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_meta_updated_at BEFORE UPDATE ON public.seo_meta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schema_markup_updated_at BEFORE UPDATE ON public.schema_markup FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_content_blocks_updated_at BEFORE UPDATE ON public.page_content_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON public.media_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internal_links_updated_at BEFORE UPDATE ON public.internal_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_tags_updated_at BEFORE UPDATE ON public.content_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON public.redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_analytics_updated_at BEFORE UPDATE ON public.page_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
