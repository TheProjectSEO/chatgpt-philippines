-- ================================================
-- RPC FUNCTIONS FOR SUPABASE
-- Migration: 20251116000003_rpc_functions.sql
-- Purpose: Custom functions for complex CMS operations
-- ================================================

-- ================================================
-- 1. INCREMENT PAGE VIEWS
-- Updates or inserts daily page analytics
-- ================================================
CREATE OR REPLACE FUNCTION increment_page_views(
    p_page_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.page_analytics (page_id, date, page_views, unique_visitors)
    VALUES (p_page_id, p_date, 1, 1)
    ON CONFLICT (page_id, date)
    DO UPDATE SET
        page_views = page_analytics.page_views + 1,
        updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION increment_page_views IS 'Increment page view count for analytics tracking';

-- ================================================
-- 2. GET PAGE BY SLUG (with all related data)
-- Returns a page with all related data in one query
-- Optimized for frontend rendering
-- ================================================
CREATE OR REPLACE FUNCTION get_page_by_slug(p_slug TEXT)
RETURNS TABLE (
    page_data JSONB,
    seo_data JSONB,
    content_blocks JSONB,
    faqs_data JSONB,
    schema_markup_data JSONB,
    categories_data JSONB,
    tags_data JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        to_jsonb(p.*) AS page_data,
        to_jsonb(s.*) AS seo_data,
        COALESCE(
            jsonb_agg(DISTINCT cb.* ORDER BY cb.position) FILTER (WHERE cb.id IS NOT NULL),
            '[]'::jsonb
        ) AS content_blocks,
        COALESCE(
            jsonb_agg(DISTINCT f.* ORDER BY f.position) FILTER (WHERE f.id IS NOT NULL),
            '[]'::jsonb
        ) AS faqs_data,
        COALESCE(
            jsonb_agg(DISTINCT sm.* ORDER BY sm.priority) FILTER (WHERE sm.id IS NOT NULL),
            '[]'::jsonb
        ) AS schema_markup_data,
        COALESCE(
            jsonb_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) AS categories_data,
        COALESCE(
            jsonb_agg(DISTINCT t.*) FILTER (WHERE t.id IS NOT NULL),
            '[]'::jsonb
        ) AS tags_data
    FROM public.pages p
    LEFT JOIN public.seo_meta s ON s.page_id = p.id
    LEFT JOIN public.page_content_blocks cb ON cb.page_id = p.id AND cb.is_active = true
    LEFT JOIN public.faqs f ON f.page_id = p.id AND f.is_active = true
    LEFT JOIN public.schema_markup sm ON sm.page_id = p.id AND sm.is_active = true
    LEFT JOIN public.page_categories pc ON pc.page_id = p.id
    LEFT JOIN public.categories c ON c.id = pc.category_id AND c.is_active = true
    LEFT JOIN public.page_tags pt ON pt.page_id = p.id
    LEFT JOIN public.content_tags t ON t.id = pt.tag_id AND t.is_active = true
    WHERE p.slug = p_slug
        AND p.is_current_version = true
        AND p.status = 'published'
    GROUP BY p.id, s.id;
END;
$$;

COMMENT ON FUNCTION get_page_by_slug IS 'Retrieve complete page data with all related content in a single query';

-- ================================================
-- 3. CREATE PAGE VERSION
-- Creates a snapshot of the current page state
-- ================================================
CREATE OR REPLACE FUNCTION create_page_version(
    p_page_id UUID,
    p_user_id UUID,
    p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_version_number INTEGER;
    v_version_id UUID;
    v_page_data JSONB;
    v_seo_data JSONB;
    v_content_data JSONB;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.page_versions
    WHERE page_id = p_page_id;

    -- Collect page data
    SELECT to_jsonb(p.*)
    INTO v_page_data
    FROM public.pages p
    WHERE p.id = p_page_id;

    -- Collect SEO data
    SELECT to_jsonb(s.*)
    INTO v_seo_data
    FROM public.seo_meta s
    WHERE s.page_id = p_page_id;

    -- Collect all content blocks
    SELECT jsonb_agg(cb.* ORDER BY cb.position)
    INTO v_content_data
    FROM public.page_content_blocks cb
    WHERE cb.page_id = p_page_id;

    -- Insert version
    INSERT INTO public.page_versions (
        page_id,
        version_number,
        title,
        content_snapshot,
        seo_snapshot,
        change_summary,
        changed_by
    )
    VALUES (
        p_page_id,
        v_version_number,
        v_page_data->>'title',
        jsonb_build_object(
            'page', v_page_data,
            'content_blocks', COALESCE(v_content_data, '[]'::jsonb)
        ),
        v_seo_data,
        p_change_summary,
        p_user_id
    )
    RETURNING id INTO v_version_id;

    RETURN v_version_id;
END;
$$;

COMMENT ON FUNCTION create_page_version IS 'Create a versioned snapshot of a page for audit trail';

-- ================================================
-- 4. RESTORE PAGE VERSION
-- Restores a page to a previous version
-- ================================================
CREATE OR REPLACE FUNCTION restore_page_version(
    p_version_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_page_id UUID;
    v_new_version_id UUID;
    v_snapshot JSONB;
    v_title TEXT;
BEGIN
    -- Get version data
    SELECT page_id, content_snapshot, title
    INTO v_page_id, v_snapshot, v_title
    FROM public.page_versions
    WHERE id = p_version_id;

    IF v_page_id IS NULL THEN
        RAISE EXCEPTION 'Version not found';
    END IF;

    -- Update page
    UPDATE public.pages
    SET
        title = v_title,
        updated_by = p_user_id,
        updated_at = NOW()
    WHERE id = v_page_id;

    -- Delete existing content blocks
    DELETE FROM public.page_content_blocks
    WHERE page_id = v_page_id;

    -- Restore content blocks from snapshot
    INSERT INTO public.page_content_blocks (
        page_id,
        block_type,
        block_data,
        position,
        is_active
    )
    SELECT
        v_page_id,
        (value->>'block_type')::VARCHAR,
        (value->'block_data')::JSONB,
        (value->>'position')::INTEGER,
        COALESCE((value->>'is_active')::BOOLEAN, true)
    FROM jsonb_array_elements(v_snapshot->'content_blocks') AS value;

    -- Create new version for this restore action
    SELECT create_page_version(
        v_page_id,
        p_user_id,
        'Restored to version ' || (SELECT version_number FROM public.page_versions WHERE id = p_version_id)
    ) INTO v_new_version_id;

    RETURN v_new_version_id;
END;
$$;

COMMENT ON FUNCTION restore_page_version IS 'Restore a page to a previous version from the audit trail';

-- ================================================
-- 5. GET RELATED PAGES
-- Returns pages related by category or internal links
-- ================================================
CREATE OR REPLACE FUNCTION get_related_pages(
    p_page_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    title VARCHAR,
    page_type_name VARCHAR,
    relevance_score INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH page_categories AS (
        SELECT category_id
        FROM public.page_categories
        WHERE page_id = p_page_id
    ),
    related_by_category AS (
        SELECT
            p.id,
            p.slug,
            p.title,
            pt.name AS page_type_name,
            COUNT(pc.category_id)::INTEGER * 2 AS relevance_score
        FROM public.pages p
        JOIN public.page_types pt ON p.page_type_id = pt.id
        JOIN public.page_categories pc ON pc.page_id = p.id
        WHERE pc.category_id IN (SELECT category_id FROM page_categories)
            AND p.id != p_page_id
            AND p.status = 'published'
            AND p.is_current_version = true
        GROUP BY p.id, p.slug, p.title, pt.name
    ),
    related_by_links AS (
        SELECT
            p.id,
            p.slug,
            p.title,
            pt.name AS page_type_name,
            1 AS relevance_score
        FROM public.pages p
        JOIN public.page_types pt ON p.page_type_id = pt.id
        JOIN public.internal_links il ON (
            il.source_page_id = p_page_id AND il.target_page_id = p.id
            OR il.target_page_id = p_page_id AND il.source_page_id = p.id
        )
        WHERE p.id != p_page_id
            AND p.status = 'published'
            AND p.is_current_version = true
            AND il.is_active = true
    ),
    combined AS (
        SELECT * FROM related_by_category
        UNION ALL
        SELECT * FROM related_by_links
    )
    SELECT
        c.id,
        c.slug,
        c.title,
        c.page_type_name,
        SUM(c.relevance_score)::INTEGER AS relevance_score
    FROM combined c
    GROUP BY c.id, c.slug, c.title, c.page_type_name
    ORDER BY relevance_score DESC, c.title
    LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_related_pages IS 'Find related pages based on categories and internal links';

-- ================================================
-- 6. SEARCH PAGES
-- Full-text search across pages
-- ================================================
CREATE OR REPLACE FUNCTION search_pages(
    p_search_query TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    slug VARCHAR,
    title VARCHAR,
    meta_description TEXT,
    page_type_name VARCHAR,
    rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.slug,
        p.title,
        sm.meta_description,
        pt.name AS page_type_name,
        ts_rank(
            to_tsvector('english', p.title || ' ' || COALESCE(sm.meta_description, '')),
            plainto_tsquery('english', p_search_query)
        ) AS rank
    FROM public.pages p
    JOIN public.page_types pt ON p.page_type_id = pt.id
    LEFT JOIN public.seo_meta sm ON sm.page_id = p.id
    WHERE p.status = 'published'
        AND p.is_current_version = true
        AND (
            to_tsvector('english', p.title || ' ' || COALESCE(sm.meta_description, ''))
            @@ plainto_tsquery('english', p_search_query)
        )
    ORDER BY rank DESC
    LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION search_pages IS 'Full-text search across published pages';

-- ================================================
-- 7. GET SITEMAP DATA
-- Returns all published pages for sitemap generation
-- ================================================
CREATE OR REPLACE FUNCTION get_sitemap_data()
RETURNS TABLE (
    slug VARCHAR,
    updated_at TIMESTAMPTZ,
    priority NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.slug,
        p.updated_at,
        CASE
            WHEN p.slug = '/' THEN 1.0
            WHEN pt.name = 'tool_page' THEN 0.8
            WHEN pt.name = 'blog_post' THEN 0.6
            ELSE 0.5
        END AS priority
    FROM public.pages p
    JOIN public.page_types pt ON p.page_type_id = pt.id
    WHERE p.status = 'published'
        AND p.is_current_version = true
    ORDER BY priority DESC, p.updated_at DESC;
END;
$$;

COMMENT ON FUNCTION get_sitemap_data IS 'Generate sitemap data for all published pages';

-- ================================================
-- 8. DUPLICATE PAGE
-- Creates a copy of a page with all its content
-- ================================================
CREATE OR REPLACE FUNCTION duplicate_page(
    p_page_id UUID,
    p_new_slug VARCHAR,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_page_id UUID;
    v_original_page RECORD;
BEGIN
    -- Get original page
    SELECT * INTO v_original_page
    FROM public.pages
    WHERE id = p_page_id;

    IF v_original_page.id IS NULL THEN
        RAISE EXCEPTION 'Page not found';
    END IF;

    -- Insert new page
    INSERT INTO public.pages (
        page_type_id,
        slug,
        title,
        status,
        created_by,
        updated_by
    )
    VALUES (
        v_original_page.page_type_id,
        p_new_slug,
        v_original_page.title || ' (Copy)',
        'draft',
        p_user_id,
        p_user_id
    )
    RETURNING id INTO v_new_page_id;

    -- Copy SEO meta
    INSERT INTO public.seo_meta (
        page_id,
        meta_title,
        meta_description,
        og_title,
        og_description,
        og_image,
        og_type,
        twitter_card,
        canonical_url,
        robots,
        keywords,
        author,
        language
    )
    SELECT
        v_new_page_id,
        meta_title,
        meta_description,
        og_title,
        og_description,
        og_image,
        og_type,
        twitter_card,
        NULL, -- Don't copy canonical URL
        robots,
        keywords,
        author,
        language
    FROM public.seo_meta
    WHERE page_id = p_page_id;

    -- Copy content blocks
    INSERT INTO public.page_content_blocks (
        page_id,
        block_type,
        block_data,
        position,
        is_active
    )
    SELECT
        v_new_page_id,
        block_type,
        block_data,
        position,
        is_active
    FROM public.page_content_blocks
    WHERE page_id = p_page_id;

    -- Copy FAQs
    INSERT INTO public.faqs (
        page_id,
        question,
        answer,
        position,
        is_active,
        category
    )
    SELECT
        v_new_page_id,
        question,
        answer,
        position,
        is_active,
        category
    FROM public.faqs
    WHERE page_id = p_page_id;

    -- Copy schema markup
    INSERT INTO public.schema_markup (
        page_id,
        schema_type,
        schema_data,
        priority,
        is_active
    )
    SELECT
        v_new_page_id,
        schema_type,
        schema_data,
        priority,
        is_active
    FROM public.schema_markup
    WHERE page_id = p_page_id;

    -- Copy categories
    INSERT INTO public.page_categories (page_id, category_id)
    SELECT v_new_page_id, category_id
    FROM public.page_categories
    WHERE page_id = p_page_id;

    -- Copy tags
    INSERT INTO public.page_tags (page_id, tag_id)
    SELECT v_new_page_id, tag_id
    FROM public.page_tags
    WHERE page_id = p_page_id;

    RETURN v_new_page_id;
END;
$$;

COMMENT ON FUNCTION duplicate_page IS 'Duplicate a page with all associated content';

-- ================================================
-- 9. GET PAGE ANALYTICS SUMMARY
-- Returns analytics summary for a date range
-- ================================================
CREATE OR REPLACE FUNCTION get_page_analytics_summary(
    p_page_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_views BIGINT,
    total_unique_visitors BIGINT,
    avg_time_on_page NUMERIC,
    avg_bounce_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        SUM(page_views)::BIGINT AS total_views,
        SUM(unique_visitors)::BIGINT AS total_unique_visitors,
        ROUND(AVG(avg_time_on_page), 2) AS avg_time_on_page,
        ROUND(AVG(bounce_rate), 2) AS avg_bounce_rate
    FROM public.page_analytics
    WHERE page_id = p_page_id
        AND date BETWEEN p_start_date AND p_end_date;
END;
$$;

COMMENT ON FUNCTION get_page_analytics_summary IS 'Get aggregated analytics for a page over a date range';

-- ================================================
-- 10. CLEANUP ORPHANED RECORDS
-- Removes orphaned content blocks, FAQs, etc.
-- ================================================
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS TABLE (
    deleted_blocks INTEGER,
    deleted_faqs INTEGER,
    deleted_schemas INTEGER,
    deleted_internal_links INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_blocks INTEGER;
    v_deleted_faqs INTEGER;
    v_deleted_schemas INTEGER;
    v_deleted_links INTEGER;
BEGIN
    -- Delete orphaned content blocks
    WITH deleted AS (
        DELETE FROM public.page_content_blocks
        WHERE page_id NOT IN (SELECT id FROM public.pages)
        RETURNING id
    )
    SELECT COUNT(*)::INTEGER INTO v_deleted_blocks FROM deleted;

    -- Delete orphaned FAQs
    WITH deleted AS (
        DELETE FROM public.faqs
        WHERE page_id NOT IN (SELECT id FROM public.pages)
        RETURNING id
    )
    SELECT COUNT(*)::INTEGER INTO v_deleted_faqs FROM deleted;

    -- Delete orphaned schema markup
    WITH deleted AS (
        DELETE FROM public.schema_markup
        WHERE page_id NOT IN (SELECT id FROM public.pages)
        RETURNING id
    )
    SELECT COUNT(*)::INTEGER INTO v_deleted_schemas FROM deleted;

    -- Delete orphaned internal links
    WITH deleted AS (
        DELETE FROM public.internal_links
        WHERE source_page_id NOT IN (SELECT id FROM public.pages)
        OR target_page_id NOT IN (SELECT id FROM public.pages)
        RETURNING id
    )
    SELECT COUNT(*)::INTEGER INTO v_deleted_links FROM deleted;

    RETURN QUERY
    SELECT v_deleted_blocks, v_deleted_faqs, v_deleted_schemas, v_deleted_links;
END;
$$;

COMMENT ON FUNCTION cleanup_orphaned_records IS 'Clean up orphaned records from deleted pages';

-- ================================================
-- 11. PUBLISH SCHEDULED PAGES
-- Publishes pages that are scheduled for the current time
-- ================================================
CREATE OR REPLACE FUNCTION publish_scheduled_pages()
RETURNS TABLE (
    page_id UUID,
    slug VARCHAR,
    title VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.pages
    SET
        status = 'published',
        published_at = NOW(),
        updated_at = NOW()
    WHERE status = 'scheduled'
        AND scheduled_publish_at <= NOW()
        AND is_current_version = true
    RETURNING id, slug, title;
END;
$$;

COMMENT ON FUNCTION publish_scheduled_pages IS 'Automatically publish pages scheduled for current time';

-- ================================================
-- 12. GET REDIRECT
-- Get active redirect for a given path
-- ================================================
CREATE OR REPLACE FUNCTION get_redirect(p_from_path TEXT)
RETURNS TABLE (
    to_path VARCHAR,
    redirect_type INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- Update hit count
    UPDATE public.redirects
    SET hit_count = hit_count + 1
    WHERE from_path = p_from_path
        AND is_active = true;

    -- Return redirect
    RETURN QUERY
    SELECT
        r.to_path,
        r.redirect_type
    FROM public.redirects r
    WHERE r.from_path = p_from_path
        AND r.is_active = true
    LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_redirect IS 'Get redirect destination and increment hit counter';

-- ================================================
-- GRANT EXECUTE PERMISSIONS
-- ================================================

-- Public functions (can be called by anonymous users)
GRANT EXECUTE ON FUNCTION increment_page_views TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_page_by_slug TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_related_pages TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_pages TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_sitemap_data TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_redirect TO authenticated, anon;

-- Authenticated functions (require login)
GRANT EXECUTE ON FUNCTION create_page_version TO authenticated;
GRANT EXECUTE ON FUNCTION restore_page_version TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_page TO authenticated;
GRANT EXECUTE ON FUNCTION get_page_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_records TO authenticated;
GRANT EXECUTE ON FUNCTION publish_scheduled_pages TO authenticated;
