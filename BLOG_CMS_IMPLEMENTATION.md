# Blog CMS Implementation Guide

## Overview

This document provides a complete guide to implementing the Blog CMS system for ChatGPT Philippines. The system is designed to integrate seamlessly with your existing Next.js 14 application and Supabase backend.

## Architecture Summary

```
Admin Panel (React) → API Routes (Next.js) → Service Layer → Supabase Database
                                                ↓
                                        Blog Public Pages
```

## Completed Components

### 1. Database Schema
**File**: `/supabase/migrations/20251116000006_create_blog_tables.sql`

Complete database structure including:
- `blog_authors` - Author profiles with social links
- `blog_categories` - Hierarchical category system
- `blog_tags` - Tag system with usage tracking
- `blog_posts` - Main blog content table
- `blog_post_seo` - SEO metadata for each post
- `blog_post_faqs` - FAQ sections for posts
- `blog_post_related` - Related post recommendations
- `blog_post_versions` - Version history and rollback
- `blog_post_analytics` - Performance metrics

**To Apply**:
```bash
# Connect to your Supabase project
cd /Users/adityaaman/Desktop/ChatGPTPH
supabase db push
# OR manually run the migration in Supabase SQL editor
```

### 2. TypeScript Types
**File**: `/types/blog-cms.ts`

Complete type definitions for:
- Blog posts, authors, categories, tags
- CRUD operation inputs
- API responses
- Editor state management
- Validation schemas

### 3. Service Layer
**File**: `/lib/services/blog.service.ts`

Data access layer with:
- `BlogService` - Full CRUD for blog posts
- `BlogAuthorService` - Author management
- `BlogCategoryService` - Category management
- `BlogTagService` - Tag management
- Helper functions for reading time calculation, TOC extraction, slug validation

### 4. API Routes

**Created Files**:
- `/app/api/blog/posts/route.ts` - List/Create posts
- `/app/api/blog/posts/[id]/route.ts` - Get/Update/Delete single post
- `/app/api/blog/authors/route.ts` - Author operations
- `/app/api/blog/categories/route.ts` - Category operations
- `/app/api/blog/tags/route.ts` - Tag operations

### 5. Admin UI Components

**Created Files**:
- `/app/admin/blog/page.tsx` - Blog post listing page with:
  - Search and filtering
  - Status badges
  - Pagination
  - Quick actions (edit, delete, preview)
- Updated: `/app/admin/components/AdminSidebar.tsx` - Added "Blog Posts" navigation

## Remaining Implementation Steps

### Step 1: Install TipTap Rich Text Editor

```bash
cd /Users/adityaaman/Desktop/ChatGPTPH

npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-code-block-lowlight @tiptap/extension-placeholder
```

### Step 2: Create Rich Text Editor Component

**File**: `/components/admin/RichTextEditor.tsx`

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { lowlight } from 'lowlight';
import { ContentBlock } from '@/types/blog';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
} from 'lucide-react';

interface RichTextEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Table,
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your blog post...',
      }),
    ],
    content: convertToHTML(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const blocks = convertHTMLToBlocks(html);
      onChange(blocks);
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-neutral-50 border-b border-neutral-300 p-2 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('bold') ? 'bg-neutral-200' : ''}\`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('italic') ? 'bg-neutral-200' : ''}\`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-neutral-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200' : ''}\`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('heading', { level: 3 }) ? 'bg-neutral-200' : ''}\`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-neutral-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('bulletList') ? 'bg-neutral-200' : ''}\`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('orderedList') ? 'bg-neutral-200' : ''}\`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-neutral-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('codeBlock') ? 'bg-neutral-200' : ''}\`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter image URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 rounded hover:bg-neutral-200"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter link URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={\`p-2 rounded hover:bg-neutral-200 \${editor.isActive('link') ? 'bg-neutral-200' : ''}\`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
          className="p-2 rounded hover:bg-neutral-200"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none p-6 min-h-[400px] focus:outline-none"
      />
    </div>
  );
}

// Helper functions to convert between TipTap HTML and ContentBlock format
function convertToHTML(blocks: ContentBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        return \`<h\${block.level}>\${block.content}</h\${block.level}>\`;
      case 'text':
        return \`<p>\${block.content}</p>\`;
      case 'list':
        const items = Array.isArray(block.content) ? block.content : [block.content];
        return \`<ul>\${items.map(item => \`<li>\${item}</li>\`).join('')}</ul>\`;
      case 'code':
        return \`<pre><code class="language-\${block.language || 'text'}">\${block.content}</code></pre>\`;
      case 'image':
        return \`<img src="\${block.content}" alt="\${block.alt || ''}" />\`;
      default:
        return '';
    }
  }).join('');
}

function convertHTMLToBlocks(html: string): ContentBlock[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: ContentBlock[] = [];

  doc.body.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'h2' || tagName === 'h3') {
        blocks.push({
          type: 'heading',
          level: parseInt(tagName.charAt(1)) as 2 | 3,
          content: element.textContent || '',
        });
      } else if (tagName === 'p') {
        blocks.push({
          type: 'text',
          content: element.textContent || '',
        });
      } else if (tagName === 'ul' || tagName === 'ol') {
        const items: string[] = [];
        element.querySelectorAll('li').forEach(li => {
          items.push(li.textContent || '');
        });
        blocks.push({
          type: 'list',
          content: items,
        });
      } else if (tagName === 'pre') {
        const code = element.querySelector('code');
        const language = code?.className.replace('language-', '') || 'text';
        blocks.push({
          type: 'code',
          language,
          content: code?.textContent || '',
        });
      } else if (tagName === 'img') {
        blocks.push({
          type: 'image',
          content: element.getAttribute('src') || '',
          alt: element.getAttribute('alt') || undefined,
        });
      }
    }
  });

  return blocks;
}
```

### Step 3: Create Blog Post Editor Page

**File**: `/app/admin/blog/new/page.tsx` and `/app/admin/blog/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ContentBlock } from '@/types/blog';
import {
  CreateBlogPostInput,
  BlogAuthor,
  BlogCategory,
  BlogTag,
} from '@/types/blog-cms';
import { Save, Eye, ArrowLeft } from 'lucide-react';

export default function BlogPostEditor() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params?.id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);

  const [formData, setFormData] = useState<Partial<CreateBlogPostInput>>({
    title: '',
    slug: '',
    excerpt: '',
    content: [],
    author_id: '',
    category_id: '',
    tag_ids: [],
    status: 'draft',
    featured_image: '',
    featured_image_alt: '',
    allow_comments: true,
    is_featured: false,
    is_indexable: true,
    seo: {
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      focus_keyword: '',
    },
    faqs: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load authors, categories, tags
      const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/blog/authors'),
        fetch('/api/blog/categories'),
        fetch('/api/blog/tags'),
      ]);

      setAuthors(await authorsRes.json());
      setCategories(await categoriesRes.json());
      setTags(await tagsRes.json());

      // If editing, load the post
      if (isEditing) {
        const postRes = await fetch(\`/api/blog/posts/\${params.id}\`);
        const post = await postRes.json();

        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author_id: post.author_id,
          category_id: post.category_id,
          tag_ids: post.tags.map((t: BlogTag) => t.id),
          status: post.status,
          featured_image: post.featured_image,
          featured_image_alt: post.featured_image_alt,
          allow_comments: post.allow_comments,
          is_featured: post.is_featured,
          is_indexable: post.is_indexable,
          seo: post.seo,
          faqs: post.faqs,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    try {
      setSaving(true);

      const url = isEditing ? \`/api/blog/posts/\${params.id}\` : '/api/blog/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status }),
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(\`Failed to save: \${error.error}\`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/blog')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Editor - 8 columns */}
          <div className="col-span-8 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Blog Post Title"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title),
                  });
                }}
                className="w-full text-4xl font-bold border-none focus:outline-none focus:ring-0 placeholder:text-neutral-300"
              />
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor
              content={formData.content || []}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          {/* Sidebar - 4 columns */}
          <div className="col-span-4 space-y-6">
            {/* Featured Image */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h3 className="text-lg font-semibold mb-4">Featured Image</h3>
              <input
                type="text"
                placeholder="Image URL"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Meta Information */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
              <h3 className="text-lg font-semibold">Settings</h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Author
                </label>
                <select
                  value={formData.author_id}
                  onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Short summary (150-200 characters)"
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
              <h3 className="text-lg font-semibold">SEO</h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo?.meta_title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, meta_title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="SEO title (50-60 characters)"
                  maxLength={70}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo?.meta_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, meta_description: e.target.value },
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Meta description (150-160 characters)"
                  maxLength={160}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Update Blog Frontend to Use Database

**File**: `/app/blog/[slug]/page.tsx`

Update the existing file to fetch from the database instead of JSON:

```typescript
// Replace the static import with API fetch
useEffect(() => {
  async function loadPost() {
    try {
      const response = await fetch(\`/api/blog/posts?slug=\${slug}\`);
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
    }
  }
  loadPost();
}, [slug]);
```

## Additional Features to Implement

### 1. Image Upload to Supabase Storage

**File**: `/app/api/blog/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileName = \`\${Date.now()}-\${file.name}\`;
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 2. Auto-Save Draft Feature

Add to your blog editor:

```typescript
useEffect(() => {
  const autoSave = setInterval(() => {
    if (formData.title && formData.content.length > 0) {
      handleSave('draft');
    }
  }, 60000); // Auto-save every 60 seconds

  return () => clearInterval(autoSave);
}, [formData]);
```

### 3. Schema Markup Generation

The blog service automatically generates table of contents and calculates reading time. For full schema markup:

```typescript
// Add to BlogService.createPost
const schemaMarkup = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  image: post.featured_image,
  datePublished: post.published_at,
  author: {
    '@type': 'Person',
    name: author.name,
  },
  publisher: {
    '@type': 'Organization',
    name: 'ChatGPT Philippines',
    logo: {
      '@type': 'ImageObject',
      url: 'https://chatgptph.com/logo.png',
    },
  },
};
```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Can create new blog post
- [ ] Can edit existing blog post
- [ ] Can delete blog post
- [ ] Rich text editor works correctly
- [ ] Image upload functionality works
- [ ] SEO metadata saves correctly
- [ ] Tags and categories can be assigned
- [ ] Published posts appear on frontend
- [ ] Draft posts are hidden from public
- [ ] Scheduled publishing works
- [ ] Related posts display correctly
- [ ] FAQ schema renders properly

## Performance Optimizations

1. **Enable database indexes** - Already included in migration
2. **Cache published posts** - Use Next.js ISR (Incremental Static Regeneration)
3. **Lazy load images** - Use Next.js Image component
4. **Paginate admin listing** - Already implemented
5. **Optimize queries** - Use Supabase selective column fetching

## Security Considerations

1. **Authentication** - Add auth middleware to all `/admin/*` routes
2. **Rate limiting** - Implement on API routes
3. **Input sanitization** - Validate all user inputs
4. **CORS** - Configure for API routes
5. **File upload validation** - Check file types and sizes

## Mobile Responsiveness

All admin components are built mobile-first with Tailwind CSS. Key breakpoints:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (responsive grid)
- Desktop: > 1024px (full layout)

## Next Steps

1. Run database migration
2. Install TipTap dependencies
3. Create rich text editor component
4. Build blog editor pages
5. Test complete workflow
6. Deploy to production

## Support

For issues or questions:
- Database: Check Supabase logs
- API: Check Next.js API logs
- Frontend: Check browser console

All files are located in `/Users/adityaaman/Desktop/ChatGPTPH/`
