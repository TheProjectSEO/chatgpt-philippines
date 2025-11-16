/**
 * SEO Metadata API Routes (By ID)
 *
 * GET    /api/admin/seo/metadata/[id] - Get single metadata
 * PUT    /api/admin/seo/metadata/[id] - Update metadata
 * DELETE /api/admin/seo/metadata/[id] - Delete metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET - Get single SEO metadata by ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'SEO metadata not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update SEO metadata
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if record exists
    const { data: existing } = await supabase
      .from('seo_metadata')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'SEO metadata not found' },
        { status: 404 }
      );
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {
      updated_by: body.updated_by || null,
    };

    // Optional fields
    if (body.page_title !== undefined) updateData.page_title = body.page_title;
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;
    if (body.meta_keywords !== undefined) updateData.meta_keywords = body.meta_keywords;

    // Robots
    if (body.robots_index !== undefined) updateData.robots_index = body.robots_index;
    if (body.robots_follow !== undefined) updateData.robots_follow = body.robots_follow;
    if (body.robots_noarchive !== undefined) updateData.robots_noarchive = body.robots_noarchive;
    if (body.robots_nosnippet !== undefined) updateData.robots_nosnippet = body.robots_nosnippet;
    if (body.robots_noimageindex !== undefined) updateData.robots_noimageindex = body.robots_noimageindex;
    if (body.robots_max_snippet !== undefined) updateData.robots_max_snippet = body.robots_max_snippet;
    if (body.robots_max_image_preview !== undefined) updateData.robots_max_image_preview = body.robots_max_image_preview;
    if (body.robots_max_video_preview !== undefined) updateData.robots_max_video_preview = body.robots_max_video_preview;

    // URLs
    if (body.canonical_url !== undefined) updateData.canonical_url = body.canonical_url;
    if (body.alternate_links !== undefined) updateData.alternate_links = body.alternate_links;

    // Open Graph
    if (body.og_title !== undefined) updateData.og_title = body.og_title;
    if (body.og_description !== undefined) updateData.og_description = body.og_description;
    if (body.og_image !== undefined) updateData.og_image = body.og_image;
    if (body.og_image_width !== undefined) updateData.og_image_width = body.og_image_width;
    if (body.og_image_height !== undefined) updateData.og_image_height = body.og_image_height;
    if (body.og_image_alt !== undefined) updateData.og_image_alt = body.og_image_alt;
    if (body.og_type !== undefined) updateData.og_type = body.og_type;
    if (body.og_url !== undefined) updateData.og_url = body.og_url;
    if (body.og_site_name !== undefined) updateData.og_site_name = body.og_site_name;
    if (body.og_locale !== undefined) updateData.og_locale = body.og_locale;

    // Open Graph Article
    if (body.og_article_published_time !== undefined) updateData.og_article_published_time = body.og_article_published_time;
    if (body.og_article_modified_time !== undefined) updateData.og_article_modified_time = body.og_article_modified_time;
    if (body.og_article_author !== undefined) updateData.og_article_author = body.og_article_author;
    if (body.og_article_section !== undefined) updateData.og_article_section = body.og_article_section;
    if (body.og_article_tags !== undefined) updateData.og_article_tags = body.og_article_tags;

    // Twitter
    if (body.twitter_card !== undefined) updateData.twitter_card = body.twitter_card;
    if (body.twitter_site !== undefined) updateData.twitter_site = body.twitter_site;
    if (body.twitter_creator !== undefined) updateData.twitter_creator = body.twitter_creator;
    if (body.twitter_title !== undefined) updateData.twitter_title = body.twitter_title;
    if (body.twitter_description !== undefined) updateData.twitter_description = body.twitter_description;
    if (body.twitter_image !== undefined) updateData.twitter_image = body.twitter_image;
    if (body.twitter_image_alt !== undefined) updateData.twitter_image_alt = body.twitter_image_alt;

    // Schema
    if (body.schema_enabled !== undefined) updateData.schema_enabled = body.schema_enabled;
    if (body.schema_types !== undefined) updateData.schema_types = body.schema_types;
    if (body.schema_data !== undefined) updateData.schema_data = body.schema_data;
    if (body.custom_schema !== undefined) updateData.custom_schema = body.custom_schema;

    // Additional
    if (body.author !== undefined) updateData.author = body.author;
    if (body.published_date !== undefined) updateData.published_date = body.published_date;
    if (body.modified_date !== undefined) updateData.modified_date = body.modified_date;
    if (body.section !== undefined) updateData.section = body.section;
    if (body.tags !== undefined) updateData.tags = body.tags;

    // Management
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Update database
    const { data, error } = await supabase
      .from('seo_metadata')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update SEO metadata' },
        { status: 500 }
      );
    }

    // Recalculate SEO score
    await supabase.rpc('calculate_seo_score', { metadata_id: id });

    // Fetch updated record with new score
    const { data: updated } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      data: updated || data,
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
// DELETE - Delete SEO metadata
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete: mark as inactive instead of actually deleting
    const { data, error } = await supabase
      .from('seo_metadata')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'SEO metadata not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SEO metadata deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
