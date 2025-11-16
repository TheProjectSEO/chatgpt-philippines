-- ================================================
-- BLOG CMS DATABASE SCHEMA
-- Migration: 20251116000006_create_blog_tables.sql
-- Purpose: Complete blog management system with categories, tags, and authors
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. BLOG AUTHORS TABLE
-- Purpose: Store blog author profiles
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(100), -- 'Content Writer', 'SEO Specialist', etc.
    social_links JSONB, -- {twitter: '', linkedin: '', website: ''}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_authors_slug ON public.blog_authors(slug);
CREATE INDEX idx_blog_authors_is_active ON public.blog_authors(is_active) WHERE is_active = true;

COMMENT ON TABLE public.blog_authors IS 'Blog author profiles with social links and bio';

-- ================================================
-- 2. BLOG CATEGORIES TABLE
-- Purpose: Categorize blog posts (AI Tools, Tutorials, News, etc.)
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color for UI display
    icon VARCHAR(100), -- Icon name from lucide-react
    parent_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    seo_title VARCHAR(70),
    seo_description VARCHAR(160),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_categories_parent_id ON public.blog_categories(parent_id);
CREATE INDEX idx_blog_categories_position ON public.blog_categories(position);
CREATE INDEX idx_blog_categories_is_active ON public.blog_categories(is_active) WHERE is_active = true;

COMMENT ON TABLE public.blog_categories IS 'Hierarchical category system for blog posts';

-- ================================================
-- 3. BLOG TAGS TABLE
-- Purpose: Tag blog posts for filtering and discovery
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    usage_count INTEGER DEFAULT 0, -- Auto-increment when used
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);
CREATE INDEX idx_blog_tags_usage_count ON public.blog_tags(usage_count DESC);
CREATE INDEX idx_blog_tags_is_active ON public.blog_tags(is_active) WHERE is_active = true;

COMMENT ON TABLE public.blog_tags IS 'Tags for blog post filtering and discovery';

-- ================================================
-- 4. BLOG POSTS TABLE (Main content)
-- Purpose: Store blog posts with rich content and metadata
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT, -- Short summary (150-200 chars)
    featured_image TEXT, -- URL to featured image
    featured_image_alt TEXT, -- Alt text for featured image

    -- Content stored as structured JSON blocks (matches existing ContentBlock type)
    content JSONB NOT NULL, -- Array of ContentBlock objects

    -- Table of contents (auto-generated from headings)
    table_of_contents JSONB, -- Array of {id, title, level}

    -- Author and metadata
    author_id UUID NOT NULL REFERENCES public.blog_authors(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,

    -- Publishing workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, scheduled, archived
    published_at TIMESTAMPTZ,
    scheduled_publish_at TIMESTAMPTZ,

    -- Engagement metrics
    reading_time INTEGER, -- Minutes (auto-calculated)
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,

    -- SEO and discoverability
    allow_comments BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false, -- Featured on homepage
    is_indexable BOOLEAN DEFAULT true,

    -- Version control
    version INTEGER DEFAULT 1,

    -- Audit fields
    created_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategic indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_is_featured ON public.blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_blog_posts_scheduled ON public.blog_posts(scheduled_publish_at) WHERE status = 'scheduled';
CREATE INDEX idx_blog_posts_view_count ON public.blog_posts(view_count DESC);

COMMENT ON TABLE public.blog_posts IS 'Main blog posts table with structured JSON content';
COMMENT ON COLUMN public.blog_posts.content IS 'Structured JSON array of ContentBlock objects for flexible rendering';
COMMENT ON COLUMN public.blog_posts.status IS 'draft (editing), published (live), scheduled (future), archived (hidden)';

-- ================================================
-- 5. BLOG POST TAGS (Many-to-Many Junction)
-- Purpose: Link blog posts to multiple tags
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_blog_post_tags_post_id ON public.blog_post_tags(post_id);
CREATE INDEX idx_blog_post_tags_tag_id ON public.blog_post_tags(tag_id);

COMMENT ON TABLE public.blog_post_tags IS 'Many-to-many junction table linking posts to tags';

-- ================================================
-- 6. BLOG POST SEO TABLE
-- Purpose: Store comprehensive SEO metadata for blog posts
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_seo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,

    -- Meta tags
    meta_title VARCHAR(70), -- Recommended 50-60 chars
    meta_description VARCHAR(160), -- Recommended 150-160 chars
    meta_keywords TEXT[], -- Array of keywords

    -- Open Graph
    og_title VARCHAR(95),
    og_description VARCHAR(200),
    og_image TEXT,
    og_type VARCHAR(50) DEFAULT 'article',

    -- Twitter Card
    twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
    twitter_title VARCHAR(70),
    twitter_description VARCHAR(200),
    twitter_image TEXT,

    -- Technical SEO
    canonical_url TEXT,
    robots VARCHAR(100) DEFAULT 'index, follow',
    focus_keyword VARCHAR(100),

    -- Schema markup (JSON-LD)
    schema_markup JSONB, -- BlogPosting schema

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_post_seo UNIQUE(post_id)
);

CREATE INDEX idx_blog_post_seo_post_id ON public.blog_post_seo(post_id);
CREATE INDEX idx_blog_post_seo_keywords ON public.blog_post_seo USING GIN(meta_keywords);

COMMENT ON TABLE public.blog_post_seo IS 'SEO metadata for blog posts including Open Graph and Twitter Card';

-- ================================================
-- 7. BLOG POST FAQS TABLE
-- Purpose: Store FAQ sections for blog posts
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_post_faqs_post_id ON public.blog_post_faqs(post_id);
CREATE INDEX idx_blog_post_faqs_position ON public.blog_post_faqs(post_id, position);
CREATE INDEX idx_blog_post_faqs_active ON public.blog_post_faqs(is_active) WHERE is_active = true;

COMMENT ON TABLE public.blog_post_faqs IS 'FAQ sections for blog posts with FAQPage schema support';

-- ================================================
-- 8. BLOG POST RELATED (Many-to-Many)
-- Purpose: Link related blog posts for recommendations
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_related (
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    related_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (post_id, related_post_id),

    -- Prevent self-referencing
    CONSTRAINT no_self_reference CHECK (post_id != related_post_id)
);

CREATE INDEX idx_blog_post_related_post_id ON public.blog_post_related(post_id);
CREATE INDEX idx_blog_post_related_related_post_id ON public.blog_post_related(related_post_id);
CREATE INDEX idx_blog_post_related_position ON public.blog_post_related(post_id, position);

COMMENT ON TABLE public.blog_post_related IS 'Related blog posts for cross-linking and recommendations';

-- ================================================
-- 9. BLOG POST VERSIONS (Audit Trail)
-- Purpose: Store complete history of blog post changes
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_snapshot JSONB NOT NULL, -- Full content at this version
    seo_snapshot JSONB, -- SEO meta at this version
    change_summary TEXT, -- Description of changes
    changed_by UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_post_version UNIQUE(post_id, version_number)
);

CREATE INDEX idx_blog_post_versions_post_id ON public.blog_post_versions(post_id);
CREATE INDEX idx_blog_post_versions_created_at ON public.blog_post_versions(created_at DESC);
CREATE INDEX idx_blog_post_versions_version_number ON public.blog_post_versions(post_id, version_number DESC);

COMMENT ON TABLE public.blog_post_versions IS 'Version history for blog posts with rollback support';

-- ================================================
-- 10. BLOG POST ANALYTICS (Daily aggregates)
-- Purpose: Track blog post performance metrics
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTEGER, -- Seconds
    bounce_rate DECIMAL(5,2), -- Percentage
    social_shares INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_post_analytics_date UNIQUE(post_id, date)
);

CREATE INDEX idx_blog_post_analytics_post_id ON public.blog_post_analytics(post_id);
CREATE INDEX idx_blog_post_analytics_date ON public.blog_post_analytics(date DESC);
CREATE INDEX idx_blog_post_analytics_post_date ON public.blog_post_analytics(post_id, date DESC);

COMMENT ON TABLE public.blog_post_analytics IS 'Daily analytics aggregates for blog posts';

-- ================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ================================================

CREATE TRIGGER update_blog_authors_updated_at
    BEFORE UPDATE ON public.blog_authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
    BEFORE UPDATE ON public.blog_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_post_seo_updated_at
    BEFORE UPDATE ON public.blog_post_seo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_post_faqs_updated_at
    BEFORE UPDATE ON public.blog_post_faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_post_analytics_updated_at
    BEFORE UPDATE ON public.blog_post_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- TRIGGER: Auto-increment tag usage count
-- ================================================

CREATE OR REPLACE FUNCTION increment_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.blog_tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.blog_tags
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.tag_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tag_usage_increment
    AFTER INSERT ON public.blog_post_tags
    FOR EACH ROW EXECUTE FUNCTION increment_tag_usage();

CREATE TRIGGER tag_usage_decrement
    AFTER DELETE ON public.blog_post_tags
    FOR EACH ROW EXECUTE FUNCTION decrement_tag_usage();

-- ================================================
-- RPC FUNCTION: Get published blog posts with pagination
-- ================================================

CREATE OR REPLACE FUNCTION get_published_blog_posts(
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_category_id UUID DEFAULT NULL,
    p_tag_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    featured_image_alt TEXT,
    author_name VARCHAR,
    author_avatar TEXT,
    category_name VARCHAR,
    published_at TIMESTAMPTZ,
    reading_time INTEGER,
    view_count INTEGER,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.featured_image_alt,
        ba.name as author_name,
        ba.avatar_url as author_avatar,
        bc.name as category_name,
        bp.published_at,
        bp.reading_time,
        bp.view_count,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object('id', bt.id, 'name', bt.name, 'slug', bt.slug))
                FROM public.blog_post_tags bpt
                JOIN public.blog_tags bt ON bpt.tag_id = bt.id
                WHERE bpt.post_id = bp.id AND bt.is_active = true
            ),
            '[]'::jsonb
        ) as tags
    FROM public.blog_posts bp
    LEFT JOIN public.blog_authors ba ON bp.author_id = ba.id
    LEFT JOIN public.blog_categories bc ON bp.category_id = bc.id
    WHERE bp.status = 'published'
        AND bp.is_indexable = true
        AND bp.published_at <= NOW()
        AND (p_category_id IS NULL OR bp.category_id = p_category_id)
        AND (p_tag_id IS NULL OR bp.id IN (
            SELECT post_id FROM public.blog_post_tags WHERE tag_id = p_tag_id
        ))
    ORDER BY bp.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_published_blog_posts IS 'Fetch published blog posts with author, category, and tags';
