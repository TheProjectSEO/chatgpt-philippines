/**
 * Single Blog Post API Route
 * GET /api/blog/posts/[id] - Get a single blog post
 * PUT /api/blog/posts/[id] - Update a blog post
 * DELETE /api/blog/posts/[id] - Delete a blog post
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/lib/services/blog.service';
import { UpdateBlogPostInput } from '@/types/blog-cms';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await BlogService.getPostById(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateBlogPostInput = await request.json();

    // Ensure ID matches
    if (body.id && body.id !== params.id) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
    }

    body.id = params.id;

    // Check if slug is available (if slug is being updated)
    if (body.slug) {
      const slugCheck = await BlogService.checkSlug(body.slug, params.id);
      if (!slugCheck.available) {
        return NextResponse.json(
          { error: 'Slug already exists', suggestion: slugCheck.suggestion },
          { status: 409 }
        );
      }
    }

    // Update blog post
    const post = await BlogService.updatePost(body);

    return NextResponse.json(post, { status: 200 });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await BlogService.deletePost(params.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
