/**
 * Auto-Discover Pages for Sitemap
 *
 * POST /api/admin/seo/sitemap/discover - Auto-discover all pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// POST - Auto-discover pages
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const discoveredPages = await discoverPages();
    let created = 0;
    let updated = 0;

    for (const page of discoveredPages) {
      // Check if entry already exists
      const { data: existing } = await supabase
        .from('sitemap_config')
        .select('*')
        .eq('page_path', page.path)
        .single();

      if (existing) {
        // Update last_modified
        await supabase
          .from('sitemap_config')
          .update({ last_modified: new Date().toISOString() })
          .eq('page_path', page.path);
        updated++;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('sitemap_config')
          .insert({
            page_path: page.path,
            include_in_sitemap: page.includeInSitemap,
            priority: page.priority,
            changefreq: page.changefreq,
            last_modified: new Date().toISOString(),
          });

        if (!error) {
          created++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      discovered: discoveredPages.length,
      created,
      updated,
      pages: discoveredPages,
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

interface DiscoveredPage {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  includeInSitemap: boolean;
}

async function discoverPages(): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];

  // Define static pages with their priorities
  const staticPages: DiscoveredPage[] = [
    { path: '/', priority: 1.0, changefreq: 'daily', includeInSitemap: true },
    { path: '/about', priority: 0.8, changefreq: 'monthly', includeInSitemap: true },
    { path: '/contact', priority: 0.7, changefreq: 'monthly', includeInSitemap: true },
    { path: '/privacy', priority: 0.5, changefreq: 'yearly', includeInSitemap: true },
    { path: '/terms', priority: 0.5, changefreq: 'yearly', includeInSitemap: true },
  ];

  pages.push(...staticPages);

  // Define tool pages
  const toolPages = [
    'paraphraser',
    'grammar-checker',
    'chat',
    'ai-detector',
    'plagiarism-checker',
    'image-generator',
    'translator',
    'summarizer',
    'essay-write',
    'cover-letter',
    'citation-generate',
    'bibliography',
    'active-to-passive',
    'article-rewrite',
    'business-plan',
    'code-generate',
    'conclusion-generate',
    'email-write',
    'data-processor',
    'data-viz',
    'code-analyzer',
  ];

  for (const tool of toolPages) {
    pages.push({
      path: `/${tool}`,
      priority: 0.9,
      changefreq: 'weekly',
      includeInSitemap: true,
    });
  }

  // Fetch blog articles from database if blog table exists
  try {
    const { data: articles } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('published', true);

    if (articles) {
      for (const article of articles) {
        pages.push({
          path: `/blog/${article.slug}`,
          priority: 0.7,
          changefreq: 'monthly',
          includeInSitemap: true,
        });
      }
    }
  } catch (error) {
    console.log('No blog posts table or no articles found');
  }

  // Exclude admin and API routes
  const excludePaths = ['/admin', '/api'];
  const filteredPages = pages.filter(
    page => !excludePaths.some(excluded => page.path.startsWith(excluded))
  );

  return filteredPages;
}
