# WordPress-like CMS Implementation Guide

Complete step-by-step guide to implement the CMS system in your Next.js application.

## Phase 1: Database Setup (Week 1)

### Step 1.1: Run Database Migration

```bash
# Navigate to your project directory
cd /Users/adityaaman/Desktop/ChatGPTPH

# Connect to your Supabase project
# Run the migration file
psql <your-connection-string> < supabase/migrations/003_cms_tables.sql
```

Or use Supabase CLI:

```bash
npx supabase db push supabase/migrations/003_cms_tables.sql
```

### Step 1.2: Verify Tables Created

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'pages', 'seo_metadata', 'faqs', 'media',
  'page_components', 'page_revisions',
  'internal_links', 'scheduled_publishes',
  'admin_permissions'
);
```

### Step 1.3: Create First Admin User

```sql
-- Get your Auth0 user ID and insert into admin_permissions
INSERT INTO admin_permissions (user_id, role)
VALUES ('your-auth0-user-id', 'super_admin');
```

## Phase 2: Install Dependencies (Week 1)

```bash
# Core CMS dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-highlight

# Form handling
npm install react-hook-form @hookform/resolvers/zod zod

# State management
npm install @tanstack/react-query @tanstack/react-table

# UI components (if not already installed)
npm install lucide-react clsx tailwind-merge

# Utilities
npm install date-fns lodash
npm install -D @types/lodash
```

## Phase 3: Update Supabase Types (Week 1)

Update `/lib/supabase.ts` to include CMS types:

```typescript
// Add to existing Database interface
export interface Database {
  public: {
    Tables: {
      // Existing tables
      users: { /* ... */ };
      chats: { /* ... */ };
      messages: { /* ... */ };

      // NEW CMS tables
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          page_type: 'tool' | 'home' | 'static' | 'landing';
          content: any;
          status: 'draft' | 'published' | 'scheduled' | 'archived';
          // ... rest of fields
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
      seo_metadata: { /* ... */ };
      faqs: { /* ... */ };
      media: { /* ... */ };
      page_components: { /* ... */ };
      page_revisions: { /* ... */ };
      internal_links: { /* ... */ };
      scheduled_publishes: { /* ... */ };
      admin_permissions: { /* ... */ };
    };
  };
}
```

## Phase 4: Core Infrastructure (Week 2)

### Step 4.1: Setup Middleware

Create `/middleware.ts` (use code from `CMS_AUTHENTICATION_PERMISSIONS.md`)

### Step 4.2: Create Service Layer

```bash
# All service files are already created at:
# /lib/cms/services/page.service.ts
# /lib/cms/services/permission.service.ts
# etc.
```

### Step 4.3: Create Repository Layer

```bash
# All repository files are already created at:
# /lib/cms/repositories/base.repository.ts
# /lib/cms/repositories/page.repository.ts
# etc.
```

### Step 4.4: Create Validation Schemas

```bash
# Validation schemas are at:
# /lib/cms/validation/page.schema.ts
```

## Phase 5: Admin Layout (Week 2)

### Step 5.1: Create Admin Layout

Create `/app/admin/layout.tsx`:

```typescript
import { AdminSidebar } from './components/admin-sidebar';
import { AdminHeader } from './components/admin-header';
import { getUserSession, checkAdminPermissions } from '@/lib/cms/utils/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session) {
    redirect('/api/auth/login?returnTo=/admin');
  }

  const hasPermission = await checkAdminPermissions(session.user.sub);

  if (!hasPermission) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Step 5.2: Create Sidebar Component

Create `/app/admin/components/admin-sidebar.tsx` (use code from `CMS_COMPONENT_ARCHITECTURE.md`)

### Step 5.3: Create Header Component

Create `/app/admin/components/admin-header.tsx`:

```typescript
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Bell, User } from 'lucide-react';

export function AdminHeader() {
  const { user } = useUser();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">Content Management</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
```

## Phase 6: Pages Management (Week 3)

### Step 6.1: Create Pages List Page

Create `/app/admin/pages/page.tsx`:

```typescript
import { pageService } from '@/lib/cms/services/page.service';
import { PageList } from './components/page-list';
import Link from 'next/link';

export default async function PagesListPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const result = await pageService.getPages({
    page: parseInt(searchParams.page || '1'),
    per_page: 20,
    status: searchParams.status as any,
  });

  if (!result.success || !result.data) {
    return <div>Error loading pages</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Page
        </Link>
      </div>

      <PageList
        pages={result.data.items}
        pagination={result.data.pagination}
      />
    </div>
  );
}
```

### Step 6.2: Create Page List Component

Create `/app/admin/pages/components/page-list.tsx`:

```typescript
'use client';

import { DataTable } from '@/components/cms/ui/data-table';
import { PageWithRelations } from '@/lib/cms/types';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const columns: ColumnDef<PageWithRelations>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <Link
        href={`/admin/pages/${row.original.id}/edit`}
        className="text-blue-600 hover:underline font-medium"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => (
      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
        /{row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: 'page_type',
    header: 'Type',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const colors = {
        draft: 'bg-gray-100 text-gray-800',
        published: 'bg-green-100 text-green-800',
        scheduled: 'bg-blue-100 text-blue-800',
        archived: 'bg-red-100 text-red-800',
      };

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Last Modified',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {formatDistanceToNow(new Date(row.original.updated_at), { addSuffix: true })}
      </span>
    ),
  },
];

interface PageListProps {
  pages: PageWithRelations[];
  pagination: any;
}

export function PageList({ pages, pagination }: PageListProps) {
  return <DataTable columns={columns} data={pages} />;
}
```

### Step 6.3: Create New Page Route

Create `/app/admin/pages/new/page.tsx`:

```typescript
import { PageForm } from '../components/page-form';

export default function NewPagePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Page</h1>
      <PageForm mode="create" />
    </div>
  );
}
```

### Step 6.4: Create Edit Page Route

Create `/app/admin/pages/[id]/edit/page.tsx`:

```typescript
import { pageService } from '@/lib/cms/services/page.service';
import { PageForm } from '../../components/page-form';
import { notFound } from 'next/navigation';

export default async function EditPagePage({
  params,
}: {
  params: { id: string };
}) {
  const result = await pageService.getPageById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
      <PageForm
        mode="edit"
        pageId={params.id}
        initialData={result.data}
      />
    </div>
  );
}
```

## Phase 7: WYSIWYG Editor (Week 3)

Create TipTap editor components as detailed in `CMS_WYSIWYG_INTEGRATION.md`:

1. `/components/cms/editor/tiptap-editor.tsx`
2. `/components/cms/editor/toolbar.tsx`
3. `/components/cms/editor/bubble-menu.tsx`

## Phase 8: Preview System (Week 4)

Implement preview system as detailed in `CMS_PREVIEW_SYSTEM.md`:

1. `/components/cms/preview/split-view.tsx`
2. `/components/cms/preview/preview-frame.tsx`
3. `/components/cms/preview/preview-toolbar.tsx`
4. `/app/api/admin/pages/[id]/preview/route.ts`

## Phase 9: Dynamic Page Rendering (Week 4)

Create public-facing dynamic route:

### `/app/[slug]/page.tsx`

```typescript
import { pageService } from '@/lib/cms/services/page.service';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await pageService.getPageBySlug(params.slug);

  if (!result.success || !result.data) {
    return { title: 'Page Not Found' };
  }

  const page = result.data;
  const seo = page.seo_metadata;

  return {
    title: seo?.meta_title || page.title,
    description: seo?.meta_description || undefined,
    keywords: seo?.meta_keywords || undefined,
    openGraph: {
      title: seo?.og_title || page.title,
      description: seo?.og_description || undefined,
      images: seo?.og_image ? [seo.og_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.twitter_title || page.title,
      description: seo?.twitter_description || undefined,
      images: seo?.twitter_image ? [seo.twitter_image] : undefined,
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const result = await pageService.getPageBySlug(params.slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const page = result.data;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

      {/* Render page content */}
      <div className="prose prose-lg">
        {/* TODO: Implement content renderer based on page.content structure */}
      </div>

      {/* Render FAQs if present */}
      {page.faqs && page.faqs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Generate static params for all published pages
export async function generateStaticParams() {
  const result = await pageService.getPages({
    status: 'published',
    per_page: 1000,
  });

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.items.map((page) => ({
    slug: page.slug,
  }));
}
```

## Phase 10: Testing & Deployment (Week 5)

### Step 10.1: Test Admin Access

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/admin
# Verify authentication redirects to Auth0 login
# After login, verify admin panel loads
```

### Step 10.2: Create Test Pages

1. Login to `/admin`
2. Click "Create New Page"
3. Fill in form:
   - Title: "Test Page"
   - Slug: "test-page"
   - Page Type: "static"
   - Content: Add some sample content
   - Status: "published"
4. Click "Create Page"
5. Verify page appears in list
6. Visit `/test-page` to see public page

### Step 10.3: Environment Variables

Ensure all environment variables are set:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=your-auth0-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Step 10.4: Deploy to Vercel

```bash
# Build locally first
npm run build

# If successful, deploy
vercel --prod
```

## Troubleshooting

### Issue: "Middleware not working"
- Verify `/middleware.ts` is at project root
- Check `config.matcher` patterns
- Ensure Auth0 environment variables are set

### Issue: "Permission denied errors"
- Check RLS policies in Supabase
- Verify user exists in `admin_permissions` table
- Check `SUPABASE_SERVICE_KEY` is set correctly

### Issue: "Editor not loading"
- Check TipTap dependencies are installed
- Verify dynamic import with `ssr: false`
- Check browser console for errors

### Issue: "Preview not updating"
- Check postMessage communication in browser DevTools
- Verify iframe src URL is correct
- Check CORS settings

## Next Steps

After basic implementation:

1. **SEO Management**: Implement SEO editing UI
2. **Media Library**: Build file upload and management
3. **FAQ Management**: Create FAQ CRUD interface
4. **Internal Links**: Implement link management
5. **Scheduled Publishing**: Add cron job for scheduled posts
6. **Analytics**: Add page view tracking
7. **Revisions**: Build revision comparison UI
8. **Bulk Actions**: Implement bulk operations

## Performance Optimization Checklist

- [ ] Enable Vercel Edge Functions for middleware
- [ ] Implement ISR (Incremental Static Regeneration) for pages
- [ ] Add Redis caching layer for frequently accessed data
- [ ] Optimize images with Next.js Image component
- [ ] Implement lazy loading for heavy components
- [ ] Add database query caching
- [ ] Set up CDN for static assets
- [ ] Enable gzip/brotli compression

## Security Checklist

- [ ] Enable 2FA for admin accounts
- [ ] Implement rate limiting on API routes
- [ ] Add CSRF protection
- [ ] Enable audit logging for all admin actions
- [ ] Set up backup system for database
- [ ] Implement content sanitization for user input
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Congratulations!

You now have a fully functional WordPress-like CMS system built on Next.js!
