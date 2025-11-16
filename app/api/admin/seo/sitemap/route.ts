/**
 * Sitemap Management API Routes
 *
 * GET  /api/admin/seo/sitemap - Get all sitemap entries
 * PUT  /api/admin/seo/sitemap - Update sitemap entry
 * POST /api/admin/seo/sitemap/generate - Generate sitemap XML
 * POST /api/admin/seo/sitemap/discover - Auto-discover pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET - Get all sitemap entries
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('sitemap_config')
      .select('*')
      .order('priority', { ascending: false })
      .order('page_path', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sitemap entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update sitemap entry
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.page_path) {
      return NextResponse.json(
        { error: 'Missing required field: page_path' },
        { status: 400 }
      );
    }

    // Check if entry exists
    const { data: existing } = await supabase
      .from('sitemap_config')
      .select('*')
      .eq('page_path', body.page_path)
      .single();

    const updateData = {
      include_in_sitemap: body.include_in_sitemap ?? true,
      priority: body.priority ?? 0.5,
      changefreq: body.changefreq || 'weekly',
      last_modified: body.last_modified || new Date().toISOString(),
    };

    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from('sitemap_config')
        .update(updateData)
        .eq('page_path', body.page_path)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to update sitemap entry' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Sitemap entry updated successfully',
      });
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('sitemap_config')
        .insert({
          page_path: body.page_path,
          ...updateData,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to create sitemap entry' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Sitemap entry created successfully',
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
