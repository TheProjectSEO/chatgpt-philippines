/**
 * Robots.txt Management API Routes
 *
 * GET /api/admin/seo/robots - Get active robots.txt
 * PUT /api/admin/seo/robots - Update robots.txt
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET - Get active robots.txt
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('robots_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Return default robots.txt if none exists
      return NextResponse.json({
        data: {
          id: null,
          content: `# Robots.txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://chatgpt-philippines.com'}/sitemap.xml`,
          is_active: true,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
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
// PUT - Update robots.txt
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }

    // Deactivate current active robots.txt
    await supabase
      .from('robots_config')
      .update({ is_active: false })
      .eq('is_active', true);

    // Get the latest version number
    const { data: latestVersion } = await supabase
      .from('robots_config')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const newVersion = (latestVersion?.version || 0) + 1;

    // Insert new robots.txt configuration
    const { data, error } = await supabase
      .from('robots_config')
      .insert({
        content: body.content,
        is_active: true,
        version: newVersion,
        change_notes: body.notes || null,
        created_by: body.created_by || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update robots.txt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Robots.txt updated successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
