/**
 * Blog Tags API Route
 * GET /api/blog/tags - List all blog tags or search
 * POST /api/blog/tags - Create a new tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlogTagService } from '@/lib/services/blog.service';
import { CreateBlogTagInput } from '@/types/blog-cms';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const tags = search
      ? await BlogTagService.searchTags(search)
      : await BlogTagService.listTags();

    return NextResponse.json(tags, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogTagInput = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const tag = await BlogTagService.createTag(body);
    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog tag:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog tag' },
      { status: 500 }
    );
  }
}
