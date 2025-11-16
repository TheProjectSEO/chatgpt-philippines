import { NextResponse } from 'next/server'
import {
  getAllPages,
  getPageBySlug,
  getPagesByCategory,
  searchPages,
  getAllCategories,
  getToolPages,
  type PageRegistryItem,
} from '@/lib/pageRegistry'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const slug = searchParams.get('slug')
    const toolsOnly = searchParams.get('toolsOnly') === 'true'

    let pages: PageRegistryItem[]

    // If requesting single page by slug
    if (slug) {
      const page = getPageBySlug(slug)
      if (!page) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ page })
    }

    // Get pages with filters
    if (search) {
      pages = searchPages(search)
    } else if (category) {
      pages = getPagesByCategory(category)
    } else if (toolsOnly) {
      pages = getToolPages()
    } else {
      pages = getAllPages()
    }

    // Apply status filter if provided
    if (status && status !== 'all') {
      pages = pages.filter(page => page.status === status)
    }

    // Sort by title
    pages.sort((a, b) => a.title.localeCompare(b.title))

    // Add some metadata
    const metadata = {
      total: pages.length,
      categories: getAllCategories(),
      statuses: ['published', 'draft', 'archived'],
    }

    return NextResponse.json({
      pages,
      metadata,
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

/**
 * Create a new page with full content
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, status, category, description, content } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // TODO: Save to database (Supabase pages table)
    // This is a placeholder implementation
    const newPage = {
      id: `page-${Date.now()}`,
      title,
      slug,
      status: status || 'draft',
      category: category || 'static',
      description,
      content, // Full PageContent JSON structure
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('Creating new page:', newPage)

    return NextResponse.json(
      {
        success: true,
        message: 'Page created successfully',
        page: newPage
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    )
  }
}

/**
 * Update an existing page
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, title, slug, status, category, description, content } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    // TODO: Update in database
    const updatedPage = {
      id,
      title,
      slug,
      status,
      category,
      description,
      content,
      updated_at: new Date().toISOString(),
    }

    console.log('Updating page:', updatedPage)

    return NextResponse.json(
      {
        success: true,
        message: 'Page updated successfully',
        page: updatedPage
      }
    )
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

/**
 * Delete a page
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    // TODO: Delete from database
    console.log('Deleting page:', id)

    return NextResponse.json(
      {
        success: true,
        message: 'Page deleted successfully'
      }
    )
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}
