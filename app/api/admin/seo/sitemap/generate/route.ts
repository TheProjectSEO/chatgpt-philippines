/**
 * Sitemap XML Generator API Route
 *
 * POST /api/admin/seo/sitemap/generate - Generate sitemap XML
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chatgpt-philippines.com';

// ============================================================================
// POST - Generate Sitemap XML
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Fetch all sitemap entries that should be included
    const { data: entries, error } = await supabase
      .from('sitemap_config')
      .select('*')
      .eq('include_in_sitemap', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sitemap entries' },
        { status: 500 }
      );
    }

    // Generate XML
    const xml = generateSitemapXML(entries || []);

    return NextResponse.json({
      success: true,
      xml,
      entries: entries?.length || 0,
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
// Helper Functions
// ============================================================================

interface SitemapEntry {
  page_path: string;
  priority: number;
  changefreq: string;
  last_modified: string | null;
  updated_at: string;
}

function generateSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const lastmod = entry.last_modified || entry.updated_at;
    const formattedDate = new Date(lastmod).toISOString().split('T')[0];

    return `  <url>
    <loc>${SITE_URL}${entry.page_path}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
