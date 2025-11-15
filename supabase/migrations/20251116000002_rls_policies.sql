-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20251116000002_rls_policies.sql
-- Purpose: Implement security policies for Auth0 integration
-- ================================================

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_markup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

-- ================================================
-- HELPER FUNCTION: Check if user is admin
-- ================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.cms_users
        WHERE cms_users.auth_user_id = auth.uid()
        AND cms_users.role = 'admin'
        AND cms_users.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- HELPER FUNCTION: Check if user is editor or admin
-- ================================================
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.cms_users
        WHERE cms_users.auth_user_id = auth.uid()
        AND cms_users.role IN ('admin', 'editor')
        AND cms_users.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- HELPER FUNCTION: Check if user has any CMS role
-- ================================================
CREATE OR REPLACE FUNCTION has_cms_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.cms_users
        WHERE cms_users.auth_user_id = auth.uid()
        AND cms_users.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- CMS USERS POLICIES
-- ================================================

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.cms_users
    FOR SELECT
    USING (is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.cms_users
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- Admins can insert users
CREATE POLICY "Admins can create users" ON public.cms_users
    FOR INSERT
    WITH CHECK (is_admin());

-- Admins can update users
CREATE POLICY "Admins can update users" ON public.cms_users
    FOR UPDATE
    USING (is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.cms_users
    FOR UPDATE
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- ================================================
-- PAGE TYPES POLICIES
-- ================================================

-- Anyone can view active page types
CREATE POLICY "Anyone can view active page types" ON public.page_types
    FOR SELECT
    USING (is_active = true);

-- Admins have full access to page types
CREATE POLICY "Admins have full access to page types" ON public.page_types
    FOR ALL
    USING (is_admin());

-- ================================================
-- PAGES POLICIES
-- ================================================

-- Public can view published pages
CREATE POLICY "Public can view published pages" ON public.pages
    FOR SELECT
    USING (status = 'published' AND is_current_version = true);

-- Authenticated users with CMS access can view all pages
CREATE POLICY "CMS users can view all pages" ON public.pages
    FOR SELECT
    USING (has_cms_access());

-- Editors and admins can create pages
CREATE POLICY "Editors can create pages" ON public.pages
    FOR INSERT
    WITH CHECK (is_editor_or_admin());

-- Editors and admins can update pages
CREATE POLICY "Editors can update pages" ON public.pages
    FOR UPDATE
    USING (is_editor_or_admin());

-- Only admins can delete pages
CREATE POLICY "Admins can delete pages" ON public.pages
    FOR DELETE
    USING (is_admin());

-- ================================================
-- SEO META POLICIES
-- ================================================

-- Public can view SEO meta for published pages
CREATE POLICY "Public can view published page SEO" ON public.seo_meta
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pages
            WHERE pages.id = seo_meta.page_id
            AND pages.status = 'published'
            AND pages.is_current_version = true
        )
    );

-- CMS users can view all SEO meta
CREATE POLICY "CMS users can view all SEO meta" ON public.seo_meta
    FOR SELECT
    USING (has_cms_access());

-- Editors can manage SEO meta
CREATE POLICY "Editors can manage SEO meta" ON public.seo_meta
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- SCHEMA MARKUP POLICIES
-- ================================================

-- Public can view active schema markup for published pages
CREATE POLICY "Public can view published schema markup" ON public.schema_markup
    FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.pages
            WHERE pages.id = schema_markup.page_id
            AND pages.status = 'published'
            AND pages.is_current_version = true
        )
    );

-- CMS users can view all schema markup
CREATE POLICY "CMS users can view all schema markup" ON public.schema_markup
    FOR SELECT
    USING (has_cms_access());

-- Editors can manage schema markup
CREATE POLICY "Editors can manage schema markup" ON public.schema_markup
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- PAGE CONTENT BLOCKS POLICIES
-- ================================================

-- Public can view active content blocks for published pages
CREATE POLICY "Public can view published content blocks" ON public.page_content_blocks
    FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.pages
            WHERE pages.id = page_content_blocks.page_id
            AND pages.status = 'published'
            AND pages.is_current_version = true
        )
    );

-- CMS users can view all content blocks
CREATE POLICY "CMS users can view all content blocks" ON public.page_content_blocks
    FOR SELECT
    USING (has_cms_access());

-- Editors can manage content blocks
CREATE POLICY "Editors can manage content blocks" ON public.page_content_blocks
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- FAQS POLICIES
-- ================================================

-- Public can view active FAQs for published pages
CREATE POLICY "Public can view published FAQs" ON public.faqs
    FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM public.pages
            WHERE pages.id = faqs.page_id
            AND pages.status = 'published'
            AND pages.is_current_version = true
        )
    );

-- CMS users can view all FAQs
CREATE POLICY "CMS users can view all FAQs" ON public.faqs
    FOR SELECT
    USING (has_cms_access());

-- Editors can manage FAQs
CREATE POLICY "Editors can manage FAQs" ON public.faqs
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- MEDIA LIBRARY POLICIES
-- ================================================

-- Public can view active media
CREATE POLICY "Public can view active media" ON public.media_library
    FOR SELECT
    USING (is_active = true);

-- CMS users can view all media
CREATE POLICY "CMS users can view all media" ON public.media_library
    FOR SELECT
    USING (has_cms_access());

-- Editors can upload media
CREATE POLICY "Editors can upload media" ON public.media_library
    FOR INSERT
    WITH CHECK (is_editor_or_admin());

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads" ON public.media_library
    FOR UPDATE
    USING (
        uploaded_by = (
            SELECT id FROM public.cms_users
            WHERE auth_user_id = auth.uid()
        )
        OR is_admin()
    );

-- Admins can delete media
CREATE POLICY "Admins can delete media" ON public.media_library
    FOR DELETE
    USING (is_admin());

-- ================================================
-- INTERNAL LINKS POLICIES
-- ================================================

-- Public can view active internal links
CREATE POLICY "Public can view active internal links" ON public.internal_links
    FOR SELECT
    USING (is_active = true);

-- CMS users can view all internal links
CREATE POLICY "CMS users can view all internal links" ON public.internal_links
    FOR SELECT
    USING (has_cms_access());

-- Editors can manage internal links
CREATE POLICY "Editors can manage internal links" ON public.internal_links
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- PAGE VERSIONS POLICIES
-- ================================================

-- Only CMS users can view page versions
CREATE POLICY "CMS users can view page versions" ON public.page_versions
    FOR SELECT
    USING (has_cms_access());

-- Editors can create versions
CREATE POLICY "Editors can create versions" ON public.page_versions
    FOR INSERT
    WITH CHECK (is_editor_or_admin());

-- Only admins can delete versions
CREATE POLICY "Admins can delete versions" ON public.page_versions
    FOR DELETE
    USING (is_admin());

-- ================================================
-- CATEGORIES POLICIES
-- ================================================

-- Public can view active categories
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT
    USING (is_active = true);

-- CMS users can view all categories
CREATE POLICY "CMS users can view all categories" ON public.categories
    FOR SELECT
    USING (has_cms_access());

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL
    USING (is_admin());

-- ================================================
-- PAGE CATEGORIES POLICIES (Junction Table)
-- ================================================

-- Public can view page categories
CREATE POLICY "Public can view page categories" ON public.page_categories
    FOR SELECT
    USING (true);

-- Editors can manage page categories
CREATE POLICY "Editors can manage page categories" ON public.page_categories
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- CONTENT TAGS POLICIES
-- ================================================

-- Public can view active tags
CREATE POLICY "Public can view active tags" ON public.content_tags
    FOR SELECT
    USING (is_active = true);

-- CMS users can view all tags
CREATE POLICY "CMS users can view all tags" ON public.content_tags
    FOR SELECT
    USING (has_cms_access());

-- Editors can manage tags
CREATE POLICY "Editors can manage tags" ON public.content_tags
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- PAGE TAGS POLICIES (Junction Table)
-- ================================================

-- Public can view page tags
CREATE POLICY "Public can view page tags" ON public.page_tags
    FOR SELECT
    USING (true);

-- Editors can manage page tags
CREATE POLICY "Editors can manage page tags" ON public.page_tags
    FOR ALL
    USING (is_editor_or_admin());

-- ================================================
-- REDIRECTS POLICIES
-- ================================================

-- Public can view active redirects (for middleware)
CREATE POLICY "Public can view active redirects" ON public.redirects
    FOR SELECT
    USING (is_active = true);

-- CMS users can view all redirects
CREATE POLICY "CMS users can view all redirects" ON public.redirects
    FOR SELECT
    USING (has_cms_access());

-- Admins can manage redirects
CREATE POLICY "Admins can manage redirects" ON public.redirects
    FOR ALL
    USING (is_admin());

-- ================================================
-- PAGE ANALYTICS POLICIES
-- ================================================

-- Anonymous users can increment page views (via RPC function)
-- No direct SELECT policy for public

-- CMS users can view analytics
CREATE POLICY "CMS users can view analytics" ON public.page_analytics
    FOR SELECT
    USING (has_cms_access());

-- System can insert/update analytics
CREATE POLICY "System can manage analytics" ON public.page_analytics
    FOR ALL
    USING (true); -- This will be restricted through RPC functions

-- ================================================
-- GRANT PERMISSIONS ON HELPER FUNCTIONS
-- ================================================
GRANT EXECUTE ON FUNCTION is_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_editor_or_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_cms_access TO authenticated, anon;
