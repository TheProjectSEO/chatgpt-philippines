/**
 * Blog Categories API Route
 * GET /api/blog/categories - List all blog categories
 * POST /api/blog/categories - Create a new category
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlogCategoryService } from '@/lib/services/blog.service';
import { CreateBlogCategoryInput } from '@/types/blog-cms';

export async function GET(request: NextRequest) {
  try {
    const categories = await BlogCategoryService.listCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogCategoryInput = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const category = await BlogCategoryService.createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog category' },
      { status: 500 }
    );
  }
}
