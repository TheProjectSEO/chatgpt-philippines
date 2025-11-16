-- ================================================
-- BLOG HELPER FUNCTIONS AND PROCEDURES
-- Migration: 20251116000007_blog_helper_functions.sql
-- Purpose: Utility functions for blog operations
-- ================================================

-- ================================================
-- 1. INCREMENT BLOG POST VIEW COUNT
-- ================================================

CREATE OR REPLACE FUNCTION increment_blog_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = view_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_blog_post_views IS 'Increment view count for a blog post';

-- ================================================
-- 2. GET BLOG POST WITH FULL DETAILS BY SLUG
-- ================================================

CREATE OR REPLACE FUNCTION get_blog_post_by_slug(post_slug VARCHAR)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    featured_image_alt TEXT,
    content JSONB,
    table_of_contents JSONB,
    author_id UUID,
    author_name VARCHAR,
    author_avatar TEXT,
    author_bio TEXT,
    category_id UUID,
    category_name VARCHAR,
    status VARCHAR,
    published_at TIMESTAMPTZ,
    reading_time INTEGER,
    view_count INTEGER,
    allow_comments BOOLEAN,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
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
        bp.content,
        bp.table_of_contents,
        bp.author_id,
        ba.name as author_name,
        ba.avatar_url as author_avatar,
        ba.bio as author_bio,
        bp.category_id,
        bc.name as category_name,
        bp.status,
        bp.published_at,
        bp.reading_time,
        bp.view_count,
        bp.allow_comments,
        bp.is_featured,
        bp.created_at,
        bp.updated_at
    FROM public.blog_posts bp
    LEFT JOIN public.blog_authors ba ON bp.author_id = ba.id
    LEFT JOIN public.blog_categories bc ON bp.category_id = bc.id
    WHERE bp.slug = post_slug
        AND bp.status = 'published'
        AND bp.is_indexable = true
        AND bp.published_at <= NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_blog_post_by_slug IS 'Fetch a published blog post by slug with author and category details';

-- ================================================
-- 3. GET RELATED BLOG POSTS
-- ================================================

CREATE OR REPLACE FUNCTION get_related_blog_posts(
    post_id UUID,
    limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    reading_time INTEGER,
    published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    -- First, try to get manually linked related posts
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.reading_time,
        bp.published_at
    FROM public.blog_post_related bpr
    JOIN public.blog_posts bp ON bpr.related_post_id = bp.id
    WHERE bpr.post_id = get_related_blog_posts.post_id
        AND bp.status = 'published'
        AND bp.is_indexable = true
    ORDER BY bpr.position
    LIMIT limit_count;

    -- If we don't have enough manual relations, fill with posts from same category
    IF (SELECT COUNT(*) FROM public.blog_post_related WHERE blog_post_related.post_id = get_related_blog_posts.post_id) < limit_count THEN
        RETURN QUERY
        SELECT
            bp.id,
            bp.title,
            bp.slug,
            bp.excerpt,
            bp.featured_image,
            bp.reading_time,
            bp.published_at
        FROM public.blog_posts bp
        WHERE bp.id != get_related_blog_posts.post_id
            AND bp.category_id = (SELECT category_id FROM public.blog_posts WHERE id = get_related_blog_posts.post_id)
            AND bp.status = 'published'
            AND bp.is_indexable = true
        ORDER BY bp.published_at DESC
        LIMIT limit_count - (SELECT COUNT(*) FROM public.blog_post_related WHERE blog_post_related.post_id = get_related_blog_posts.post_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_related_blog_posts IS 'Get related posts, first from manual relations, then from same category';

-- ================================================
-- 4. GET POPULAR BLOG POSTS
-- ================================================

CREATE OR REPLACE FUNCTION get_popular_blog_posts(
    days_back INTEGER DEFAULT 30,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    view_count INTEGER,
    reading_time INTEGER,
    published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.view_count,
        bp.reading_time,
        bp.published_at
    FROM public.blog_posts bp
    WHERE bp.status = 'published'
        AND bp.is_indexable = true
        AND bp.published_at >= NOW() - (days_back || ' days')::INTERVAL
    ORDER BY bp.view_count DESC, bp.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_popular_blog_posts IS 'Get most popular blog posts based on view count within specified days';

-- ================================================
-- 5. SEARCH BLOG POSTS (Full Text Search)
-- ================================================

CREATE OR REPLACE FUNCTION search_blog_posts(
    search_query TEXT,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    author_name VARCHAR,
    category_name VARCHAR,
    published_at TIMESTAMPTZ,
    reading_time INTEGER,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        ba.name as author_name,
        bc.name as category_name,
        bp.published_at,
        bp.reading_time,
        ts_rank(
            to_tsvector('english', bp.title || ' ' || COALESCE(bp.excerpt, '')),
            plainto_tsquery('english', search_query)
        ) as relevance
    FROM public.blog_posts bp
    LEFT JOIN public.blog_authors ba ON bp.author_id = ba.id
    LEFT JOIN public.blog_categories bc ON bp.category_id = bc.id
    WHERE bp.status = 'published'
        AND bp.is_indexable = true
        AND (
            to_tsvector('english', bp.title || ' ' || COALESCE(bp.excerpt, '')) @@ plainto_tsquery('english', search_query)
            OR bp.title ILIKE '%' || search_query || '%'
            OR bp.excerpt ILIKE '%' || search_query || '%'
        )
    ORDER BY relevance DESC, bp.published_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_blog_posts IS 'Full-text search across blog posts with relevance ranking';

-- ================================================
-- 6. GET BLOG POST TAGS
-- ================================================

CREATE OR REPLACE FUNCTION get_blog_post_tags(post_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bt.id,
        bt.name,
        bt.slug
    FROM public.blog_post_tags bpt
    JOIN public.blog_tags bt ON bpt.tag_id = bt.id
    WHERE bpt.post_id = get_blog_post_tags.post_id
        AND bt.is_active = true
    ORDER BY bt.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_blog_post_tags IS 'Get all tags for a specific blog post';

-- ================================================
-- 7. GET BLOG POSTS BY TAG
-- ================================================

CREATE OR REPLACE FUNCTION get_blog_posts_by_tag(
    tag_slug VARCHAR,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    author_name VARCHAR,
    published_at TIMESTAMPTZ,
    reading_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        ba.name as author_name,
        bp.published_at,
        bp.reading_time
    FROM public.blog_posts bp
    LEFT JOIN public.blog_authors ba ON bp.author_id = ba.id
    WHERE bp.id IN (
        SELECT bpt.post_id
        FROM public.blog_post_tags bpt
        JOIN public.blog_tags bt ON bpt.tag_id = bt.id
        WHERE bt.slug = tag_slug AND bt.is_active = true
    )
    AND bp.status = 'published'
    AND bp.is_indexable = true
    ORDER BY bp.published_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_blog_posts_by_tag IS 'Get published blog posts filtered by tag slug';

-- ================================================
-- 8. GET BLOG POSTS BY CATEGORY
-- ================================================

CREATE OR REPLACE FUNCTION get_blog_posts_by_category(
    category_slug VARCHAR,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    author_name VARCHAR,
    published_at TIMESTAMPTZ,
    reading_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        ba.name as author_name,
        bp.published_at,
        bp.reading_time
    FROM public.blog_posts bp
    LEFT JOIN public.blog_authors ba ON bp.author_id = ba.id
    LEFT JOIN public.blog_categories bc ON bp.category_id = bc.id
    WHERE bc.slug = category_slug
        AND bc.is_active = true
        AND bp.status = 'published'
        AND bp.is_indexable = true
    ORDER BY bp.published_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_blog_posts_by_category IS 'Get published blog posts filtered by category slug';

-- ================================================
-- 9. CREATE FULL TEXT SEARCH INDEX
-- ================================================

-- Create text search index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_search
ON public.blog_posts
USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

COMMENT ON INDEX idx_blog_posts_search IS 'Full-text search index for blog posts title and excerpt';

-- ================================================
-- 10. GRANT PERMISSIONS (If using RLS)
-- ================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION increment_blog_post_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_blog_post_by_slug(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_related_blog_posts(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_popular_blog_posts(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_blog_posts(TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_blog_post_tags(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_blog_posts_by_tag(VARCHAR, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_blog_posts_by_category(VARCHAR, INTEGER, INTEGER) TO anon, authenticated;
