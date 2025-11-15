-- ================================================
-- SEED DATA FOR CMS
-- Migration: 20251116000004_seed_data.sql
-- Purpose: Insert initial page types and sample categories
-- ================================================

-- ================================================
-- 1. INSERT PAGE TYPES
-- ================================================

INSERT INTO public.page_types (name, display_name, description, template_schema, is_active) VALUES
(
    'tool_page',
    'AI Tool Page',
    'Page template for AI tools (e.g., paraphrase, essay writer)',
    '{
        "fields": [
            {
                "name": "hero_title",
                "type": "text",
                "label": "Hero Title",
                "required": true
            },
            {
                "name": "hero_subtitle",
                "type": "text",
                "label": "Hero Subtitle",
                "required": false
            },
            {
                "name": "tool_description",
                "type": "rich_text",
                "label": "Tool Description",
                "required": true
            },
            {
                "name": "features",
                "type": "array",
                "label": "Features List",
                "required": false
            },
            {
                "name": "use_cases",
                "type": "array",
                "label": "Use Cases",
                "required": false
            }
        ]
    }'::jsonb,
    true
),
(
    'home_page',
    'Home Page',
    'Main landing page template',
    '{
        "fields": [
            {
                "name": "hero_title",
                "type": "text",
                "label": "Hero Title",
                "required": true
            },
            {
                "name": "hero_cta_text",
                "type": "text",
                "label": "CTA Text",
                "required": true
            },
            {
                "name": "featured_tools",
                "type": "relation",
                "label": "Featured Tools",
                "required": false
            }
        ]
    }'::jsonb,
    true
),
(
    'blog_post',
    'Blog Post',
    'Blog article template',
    '{
        "fields": [
            {
                "name": "post_title",
                "type": "text",
                "label": "Post Title",
                "required": true
            },
            {
                "name": "excerpt",
                "type": "text",
                "label": "Excerpt",
                "required": true
            },
            {
                "name": "content",
                "type": "rich_text",
                "label": "Content",
                "required": true
            },
            {
                "name": "featured_image",
                "type": "image",
                "label": "Featured Image",
                "required": false
            },
            {
                "name": "author_name",
                "type": "text",
                "label": "Author Name",
                "required": true
            },
            {
                "name": "publish_date",
                "type": "date",
                "label": "Publish Date",
                "required": true
            }
        ]
    }'::jsonb,
    true
),
(
    'static_page',
    'Static Page',
    'Generic static page (About, Contact, Privacy, etc.)',
    '{
        "fields": [
            {
                "name": "page_title",
                "type": "text",
                "label": "Page Title",
                "required": true
            },
            {
                "name": "content",
                "type": "rich_text",
                "label": "Content",
                "required": true
            }
        ]
    }'::jsonb,
    true
),
(
    'landing_page',
    'Landing Page',
    'Marketing landing page template',
    '{
        "fields": [
            {
                "name": "hero_title",
                "type": "text",
                "label": "Hero Title",
                "required": true
            },
            {
                "name": "hero_subtitle",
                "type": "text",
                "label": "Hero Subtitle",
                "required": false
            },
            {
                "name": "cta_primary",
                "type": "text",
                "label": "Primary CTA",
                "required": true
            },
            {
                "name": "benefits",
                "type": "array",
                "label": "Key Benefits",
                "required": false
            },
            {
                "name": "social_proof",
                "type": "array",
                "label": "Testimonials",
                "required": false
            }
        ]
    }'::jsonb,
    true
)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 2. INSERT SAMPLE CATEGORIES
-- ================================================

INSERT INTO public.categories (name, slug, description, icon, color, position, is_active) VALUES
('Writing Tools', 'writing-tools', 'AI-powered writing assistance tools', 'pen', '#3B82F6', 1, true),
('Paraphrasing', 'paraphrasing', 'Rephrase and reword text content', 'refresh', '#8B5CF6', 2, true),
('Grammar & Style', 'grammar-style', 'Grammar checking and style improvement', 'check-circle', '#10B981', 3, true),
('Content Generation', 'content-generation', 'Generate new content from scratch', 'sparkles', '#F59E0B', 4, true),
('Academic', 'academic', 'Tools for students and researchers', 'academic-cap', '#EF4444', 5, true),
('Business', 'business', 'Professional writing tools', 'briefcase', '#6366F1', 6, true),
('Creative Writing', 'creative-writing', 'Tools for creative content', 'lightbulb', '#EC4899', 7, true),
('SEO Tools', 'seo-tools', 'Search engine optimization tools', 'chart-bar', '#14B8A6', 8, true),
('Translation', 'translation', 'Language translation tools', 'globe', '#F97316', 9, true),
('Productivity', 'productivity', 'Efficiency and productivity tools', 'lightning-bolt', '#84CC16', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- 3. INSERT SAMPLE TAGS
-- ================================================

INSERT INTO public.content_tags (name, slug, description, is_active) VALUES
('AI Writing', 'ai-writing', 'Artificial intelligence powered writing', true),
('Free Tool', 'free-tool', 'Free to use tool', true),
('Premium', 'premium', 'Premium/paid features available', true),
('Student Friendly', 'student-friendly', 'Great for students', true),
('Professional', 'professional', 'For professional use', true),
('Beginner Friendly', 'beginner-friendly', 'Easy to use for beginners', true),
('Advanced', 'advanced', 'Advanced features for power users', true),
('Real-time', 'real-time', 'Real-time processing', true),
('Bulk Processing', 'bulk-processing', 'Can process multiple items at once', true),
('API Available', 'api-available', 'API access available', true),
('Mobile Optimized', 'mobile-optimized', 'Optimized for mobile devices', true),
('No Login Required', 'no-login-required', 'Can be used without logging in', true)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- 4. CREATE HELPER FUNCTION FOR USER CREATION
-- This makes it easier to create CMS users from auth users
-- ================================================

CREATE OR REPLACE FUNCTION create_cms_user(
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'editor'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_cms_user_id UUID;
BEGIN
    -- Get auth user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', p_email;
    END IF;

    -- Check if CMS user already exists
    SELECT id INTO v_cms_user_id
    FROM public.cms_users
    WHERE auth_user_id = v_user_id;

    IF v_cms_user_id IS NOT NULL THEN
        RAISE EXCEPTION 'CMS user already exists for email %', p_email;
    END IF;

    -- Create CMS user
    INSERT INTO public.cms_users (
        auth_user_id,
        email,
        full_name,
        role
    )
    VALUES (
        v_user_id,
        p_email,
        p_full_name,
        p_role
    )
    RETURNING id INTO v_cms_user_id;

    RETURN v_cms_user_id;
END;
$$;

COMMENT ON FUNCTION create_cms_user IS 'Create a CMS user from an existing auth user by email';

GRANT EXECUTE ON FUNCTION create_cms_user TO authenticated;

-- ================================================
-- 5. CREATE FUNCTION TO INCREMENT TAG USAGE
-- Automatically track tag usage
-- ================================================

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.content_tags
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.content_tags
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on page_tags table
CREATE TRIGGER update_tag_usage_on_page_tags
AFTER INSERT OR DELETE ON public.page_tags
FOR EACH ROW
EXECUTE FUNCTION update_tag_usage_count();

COMMENT ON FUNCTION update_tag_usage_count IS 'Automatically update tag usage count when tags are added/removed';

-- ================================================
-- 6. CREATE FUNCTION TO AUTO-PUBLISH SCHEDULED PAGES
-- Can be called by a cron job
-- ================================================

COMMENT ON FUNCTION publish_scheduled_pages IS 'Call this function periodically (e.g., every minute) to auto-publish scheduled pages';

-- Example usage in a cron extension (requires pg_cron):
-- SELECT cron.schedule('publish-scheduled-pages', '* * * * *', 'SELECT publish_scheduled_pages()');

-- ================================================
-- 7. INITIAL STATISTICS VIEW
-- Useful view for dashboard analytics
-- ================================================

CREATE OR REPLACE VIEW cms_statistics AS
SELECT
    (SELECT COUNT(*) FROM public.pages WHERE status = 'published' AND is_current_version = true) as published_pages,
    (SELECT COUNT(*) FROM public.pages WHERE status = 'draft') as draft_pages,
    (SELECT COUNT(*) FROM public.pages WHERE status = 'archived') as archived_pages,
    (SELECT COUNT(*) FROM public.pages WHERE status = 'scheduled') as scheduled_pages,
    (SELECT COUNT(*) FROM public.media_library WHERE is_active = true) as total_media_files,
    (SELECT COUNT(*) FROM public.cms_users WHERE is_active = true) as active_users,
    (SELECT COUNT(*) FROM public.categories WHERE is_active = true) as active_categories,
    (SELECT COUNT(*) FROM public.content_tags WHERE is_active = true) as active_tags,
    (SELECT SUM(file_size) FROM public.media_library WHERE is_active = true) as total_media_size_bytes;

COMMENT ON VIEW cms_statistics IS 'Quick statistics overview for CMS dashboard';

-- Grant access to the view
GRANT SELECT ON cms_statistics TO authenticated;

-- ================================================
-- SUMMARY
-- ================================================

-- Display inserted counts
DO $$
DECLARE
    v_page_types_count INTEGER;
    v_categories_count INTEGER;
    v_tags_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_page_types_count FROM public.page_types;
    SELECT COUNT(*) INTO v_categories_count FROM public.categories;
    SELECT COUNT(*) INTO v_tags_count FROM public.content_tags;

    RAISE NOTICE '====================================';
    RAISE NOTICE 'Seed Data Migration Complete';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Page Types Created: %', v_page_types_count;
    RAISE NOTICE 'Categories Created: %', v_categories_count;
    RAISE NOTICE 'Tags Created: %', v_tags_count;
    RAISE NOTICE '====================================';
END $$;
