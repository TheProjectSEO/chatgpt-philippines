/**
 * Blog Posts API Route
 * GET /api/blog/posts - List all blog posts with filters and pagination
 * POST /api/blog/posts - Create a new blog post
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/lib/services/blog.service';
import { BlogPostFilters, CreateBlogPostInput } from '@/types/blog-cms';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query params
    const filters: BlogPostFilters = {
      status: (searchParams.get('status') as any) || 'all',
      category_id: searchParams.get('category_id') || undefined,
      author_id: searchParams.get('author_id') || undefined,
      tag_id: searchParams.get('tag_id') || undefined,
      search: searchParams.get('search') || undefined,
      is_featured: searchParams.get('is_featured') === 'true' || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    };

    // Extract pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch posts
    const result = await BlogService.listPosts(filters, page, limit);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogPostInput = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, author_id' },
        { status: 400 }
      );
    }

    // Check if slug is available
    const slugCheck = await BlogService.checkSlug(body.slug);
    if (!slugCheck.available) {
      return NextResponse.json(
        { error: 'Slug already exists', suggestion: slugCheck.suggestion },
        { status: 409 }
      );
    }

    // Create blog post
    const post = await BlogService.createPost(body);

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
