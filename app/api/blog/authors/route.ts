/**
 * Blog Authors API Route
 * GET /api/blog/authors - List all blog authors
 * POST /api/blog/authors - Create a new author
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlogAuthorService } from '@/lib/services/blog.service';
import { CreateBlogAuthorInput } from '@/types/blog-cms';

export async function GET(request: NextRequest) {
  try {
    const authors = await BlogAuthorService.listAuthors();
    return NextResponse.json(authors, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching blog authors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog authors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogAuthorInput = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const author = await BlogAuthorService.createAuthor(body);
    return NextResponse.json(author, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog author:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog author' },
      { status: 500 }
    );
  }
}
