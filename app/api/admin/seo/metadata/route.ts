/**
 * SEO Metadata API Routes
 *
 * GET    /api/admin/seo/metadata - List all metadata (with filters)
 * POST   /api/admin/seo/metadata - Create new metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET - List all SEO metadata
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('page_type');
    const search = searchParams.get('search');
    const pagePath = searchParams.get('page_path');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('seo_metadata')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by page_path (exact match)
    if (pagePath) {
      query = query.eq('page_path', pagePath);
    }

    // Filter by page_type
    if (pageType) {
      query = query.eq('page_type', pageType);
    }

    // Search functionality
    if (search && !pagePath) {
      query = query.or(
        `page_title.ilike.%${search}%,meta_title.ilike.%${search}%,meta_description.ilike.%${search}%,page_path.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch SEO metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create new SEO metadata
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.page_path || !body.page_type || !body.meta_title || !body.meta_description) {
      return NextResponse.json(
        { error: 'Missing required fields: page_path, page_type, meta_title, meta_description' },
        { status: 400 }
      );
    }

    // Check if page_path already exists
    const { data: existing } = await supabase
      .from('seo_metadata')
      .select('id')
      .eq('page_path', body.page_path)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'SEO metadata for this page path already exists' },
        { status: 409 }
      );
    }

    // Prepare data for insertion
    const insertData = {
      page_path: body.page_path,
      page_type: body.page_type,
      page_title: body.page_title || body.meta_title,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      meta_keywords: body.meta_keywords || [],

      // Robots
      robots_index: body.robots_index ?? true,
      robots_follow: body.robots_follow ?? true,
      robots_noarchive: body.robots_noarchive ?? false,
      robots_nosnippet: body.robots_nosnippet ?? false,
      robots_noimageindex: body.robots_noimageindex ?? false,
      robots_max_snippet: body.robots_max_snippet ?? -1,
      robots_max_image_preview: body.robots_max_image_preview ?? 'large',
      robots_max_video_preview: body.robots_max_video_preview ?? -1,

      // URLs
      canonical_url: body.canonical_url || null,
      alternate_links: body.alternate_links || [],

      // Open Graph
      og_title: body.og_title || null,
      og_description: body.og_description || null,
      og_image: body.og_image || null,
      og_image_width: body.og_image_width || 1200,
      og_image_height: body.og_image_height || 630,
      og_image_alt: body.og_image_alt || null,
      og_type: body.og_type || 'website',
      og_url: body.og_url || null,
      og_site_name: body.og_site_name || 'ChatGPT Philippines',
      og_locale: body.og_locale || 'en_PH',

      // Twitter
      twitter_card: body.twitter_card || 'summary_large_image',
      twitter_site: body.twitter_site || null,
      twitter_creator: body.twitter_creator || null,
      twitter_title: body.twitter_title || null,
      twitter_description: body.twitter_description || null,
      twitter_image: body.twitter_image || null,
      twitter_image_alt: body.twitter_image_alt || null,

      // Schema
      schema_enabled: body.schema_enabled ?? true,
      schema_types: body.schema_types || [],
      schema_data: body.schema_data || {},
      custom_schema: body.custom_schema || null,

      // Additional
      author: body.author || null,
      published_date: body.published_date || null,
      modified_date: body.modified_date || null,
      section: body.section || null,
      tags: body.tags || [],

      // Management
      priority: body.priority ?? 0,
      is_active: body.is_active ?? true,
      created_by: body.created_by || null,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('seo_metadata')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create SEO metadata' },
        { status: 500 }
      );
    }

    // Calculate SEO score
    await supabase.rpc('calculate_seo_score', { metadata_id: data.id });

    // Fetch updated record with score
    const { data: updated } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('id', data.id)
      .single();

    return NextResponse.json({
      success: true,
      data: updated || data,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
