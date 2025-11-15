-- ================================================
-- STORAGE SETUP FOR MEDIA FILES
-- Migration: 20251116000005_storage_setup.sql
-- Purpose: Configure Supabase Storage for media uploads
-- ================================================

-- Note: Storage buckets need to be created via Supabase Dashboard or CLI
-- This file documents the storage policies to apply after bucket creation

-- ================================================
-- INSTRUCTIONS FOR MANUAL BUCKET CREATION
-- ================================================

-- 1. Via Supabase Dashboard:
--    - Go to Storage section
--    - Click "Create Bucket"
--    - Bucket name: "media"
--    - Public: Yes (for public media access)
--    - File size limit: 50MB (adjust as needed)
--    - Allowed MIME types: image/*, video/*, application/pdf

-- 2. Via Supabase CLI:
--    Run: supabase storage create media --public

-- ================================================
-- STORAGE POLICIES (Apply after bucket creation)
-- ================================================

-- Policy: Allow public to view files
-- This enables public access to uploaded media files
CREATE POLICY IF NOT EXISTS "Public can view media files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Authenticated users can upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] IN ('images', 'videos', 'documents', 'temp')
);

-- Policy: Users can update their own files
CREATE POLICY IF NOT EXISTS "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'media'
    AND (auth.uid())::text = owner
);

-- Policy: Users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'media'
    AND (auth.uid())::text = owner
);

-- Policy: Admins have full access to all files
CREATE POLICY IF NOT EXISTS "Admins have full media access"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'media'
    AND EXISTS (
        SELECT 1 FROM public.cms_users
        WHERE cms_users.auth_user_id = auth.uid()
        AND cms_users.role = 'admin'
        AND cms_users.is_active = true
    )
);

-- ================================================
-- HELPER FUNCTION: Generate unique filename
-- ================================================

CREATE OR REPLACE FUNCTION generate_unique_filename(
    p_original_filename TEXT,
    p_folder TEXT DEFAULT 'images'
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_extension TEXT;
    v_base_name TEXT;
    v_unique_id TEXT;
    v_new_filename TEXT;
BEGIN
    -- Extract extension
    v_extension := LOWER(substring(p_original_filename from '\.([^.]+)$'));

    -- Generate unique ID
    v_unique_id := substring(gen_random_uuid()::text from 1 for 8);

    -- Create timestamp-based filename
    v_new_filename := p_folder || '/' ||
                      to_char(NOW(), 'YYYY/MM/DD') || '/' ||
                      v_unique_id || '.' || v_extension;

    RETURN v_new_filename;
END;
$$;

COMMENT ON FUNCTION generate_unique_filename IS 'Generate a unique filename with folder structure for storage';

GRANT EXECUTE ON FUNCTION generate_unique_filename TO authenticated;

-- ================================================
-- FUNCTION: Upload and register media file
-- ================================================

CREATE OR REPLACE FUNCTION register_media_file(
    p_file_name TEXT,
    p_original_name TEXT,
    p_file_path TEXT,
    p_file_url TEXT,
    p_file_type TEXT,
    p_mime_type TEXT,
    p_file_size BIGINT,
    p_width INTEGER DEFAULT NULL,
    p_height INTEGER DEFAULT NULL,
    p_alt_text TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_media_id UUID;
    v_cms_user_id UUID;
BEGIN
    -- Get CMS user ID if user_id provided
    IF p_user_id IS NOT NULL THEN
        SELECT id INTO v_cms_user_id
        FROM public.cms_users
        WHERE auth_user_id = p_user_id;
    END IF;

    -- Insert media record
    INSERT INTO public.media_library (
        file_name,
        original_name,
        file_path,
        file_url,
        file_type,
        mime_type,
        file_size,
        width,
        height,
        alt_text,
        uploaded_by
    )
    VALUES (
        p_file_name,
        p_original_name,
        p_file_path,
        p_file_url,
        p_file_type,
        p_mime_type,
        p_file_size,
        p_width,
        p_height,
        p_alt_text,
        v_cms_user_id
    )
    RETURNING id INTO v_media_id;

    RETURN v_media_id;
END;
$$;

COMMENT ON FUNCTION register_media_file IS 'Register an uploaded file in the media library';

GRANT EXECUTE ON FUNCTION register_media_file TO authenticated;

-- ================================================
-- FUNCTION: Delete media file
-- Also removes from storage
-- ================================================

CREATE OR REPLACE FUNCTION delete_media_file(p_media_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_file_path TEXT;
    v_user_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Get current user info
    SELECT is_admin() INTO v_is_admin;

    SELECT cms_users.id INTO v_user_id
    FROM public.cms_users
    WHERE cms_users.auth_user_id = auth.uid();

    -- Get file path
    SELECT file_path INTO v_file_path
    FROM public.media_library
    WHERE id = p_media_id;

    IF v_file_path IS NULL THEN
        RAISE EXCEPTION 'Media file not found';
    END IF;

    -- Check permissions (only owner or admin can delete)
    IF NOT v_is_admin THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.media_library
            WHERE id = p_media_id
            AND uploaded_by = v_user_id
        ) THEN
            RAISE EXCEPTION 'Permission denied';
        END IF;
    END IF;

    -- Delete from media library (this will also trigger deletion from storage via client)
    DELETE FROM public.media_library
    WHERE id = p_media_id;

    -- Note: Actual storage deletion should be done via client SDK
    -- storage.from('media').remove([v_file_path])

    RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION delete_media_file IS 'Delete a media file from the library (requires manual storage deletion via client)';

GRANT EXECUTE ON FUNCTION delete_media_file TO authenticated;

-- ================================================
-- VIEW: Media library with uploader info
-- ================================================

CREATE OR REPLACE VIEW media_library_with_uploader AS
SELECT
    m.id,
    m.file_name,
    m.original_name,
    m.file_path,
    m.file_url,
    m.file_type,
    m.mime_type,
    m.file_size,
    m.width,
    m.height,
    m.alt_text,
    m.caption,
    m.description,
    m.tags,
    m.is_active,
    m.created_at,
    m.updated_at,
    u.id as uploader_id,
    u.email as uploader_email,
    u.full_name as uploader_name
FROM public.media_library m
LEFT JOIN public.cms_users u ON m.uploaded_by = u.id;

COMMENT ON VIEW media_library_with_uploader IS 'Media library with uploader information';

GRANT SELECT ON media_library_with_uploader TO authenticated;

-- ================================================
-- FUNCTION: Get media usage
-- Find where a media file is used
-- ================================================

CREATE OR REPLACE FUNCTION get_media_usage(p_media_id UUID)
RETURNS TABLE (
    usage_type TEXT,
    page_id UUID,
    page_title TEXT,
    page_slug TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_file_url TEXT;
BEGIN
    -- Get file URL
    SELECT file_url INTO v_file_url
    FROM public.media_library
    WHERE id = p_media_id;

    IF v_file_url IS NULL THEN
        RAISE EXCEPTION 'Media file not found';
    END IF;

    -- Search in page content blocks
    RETURN QUERY
    SELECT
        'content_block'::TEXT as usage_type,
        p.id as page_id,
        p.title as page_title,
        p.slug as page_slug
    FROM public.pages p
    JOIN public.page_content_blocks cb ON cb.page_id = p.id
    WHERE cb.block_data::text LIKE '%' || v_file_url || '%'
        AND p.is_current_version = true;

    -- Search in SEO meta (og_image, twitter_image)
    RETURN QUERY
    SELECT
        'seo_meta'::TEXT as usage_type,
        p.id as page_id,
        p.title as page_title,
        p.slug as page_slug
    FROM public.pages p
    JOIN public.seo_meta s ON s.page_id = p.id
    WHERE (s.og_image = v_file_url OR s.twitter_image = v_file_url)
        AND p.is_current_version = true;
END;
$$;

COMMENT ON FUNCTION get_media_usage IS 'Find all pages using a specific media file';

GRANT EXECUTE ON FUNCTION get_media_usage TO authenticated;

-- ================================================
-- STORAGE CONFIGURATION SUMMARY
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Storage Setup Complete';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Create "media" bucket in Supabase Dashboard';
    RAISE NOTICE '2. Set bucket to public';
    RAISE NOTICE '3. Apply storage policies (see migration file)';
    RAISE NOTICE '4. Configure file size limits (recommended: 50MB)';
    RAISE NOTICE '5. Set allowed MIME types: image/*, video/*, application/pdf';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Folder Structure:';
    RAISE NOTICE '- media/images/YYYY/MM/DD/';
    RAISE NOTICE '- media/videos/YYYY/MM/DD/';
    RAISE NOTICE '- media/documents/YYYY/MM/DD/';
    RAISE NOTICE '- media/temp/ (for temporary uploads)';
    RAISE NOTICE '====================================';
END $$;
