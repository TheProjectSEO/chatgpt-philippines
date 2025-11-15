# Admin Panel Implementation Guide

Quick start guide for implementing the WordPress-like admin panel for ChatGPT Philippines CMS.

## What Has Been Created

### 1. Documentation
- **ADMIN_PANEL_DESIGN.md** - Complete design specification with wireframes
- **components/admin/README.md** - Component documentation and examples

### 2. Core Components
Three production-ready admin components:

1. **AdminLayout** (`/components/admin/AdminLayout.tsx`)
   - Master layout with sidebar and top bar
   - Mobile-responsive (drawer on mobile, collapsible on desktop)
   - Keyboard shortcuts (Alt+S)
   - Dark sidebar with brand colors

2. **PageEditorSplitView** (`/components/admin/PageEditorSplitView.tsx`)
   - Split-screen editor with live preview
   - Auto-save every 30 seconds
   - Device preview (Desktop/Tablet/Mobile)
   - WYSIWYG toolbar
   - Draft/Publish controls

3. **SEOMetaForm** (`/components/admin/SEOMetaForm.tsx`)
   - SEO metadata editor
   - Real-time validation
   - Character counters
   - Google SERP preview
   - Open Graph and Twitter Card support

### 3. Design System
Updated Tailwind config with:
- Desert Titanium Orange color palette
- Neutral warm grays
- Semantic colors (success, error, warning, info)
- Typography scale
- Admin-specific shadows

---

## Installation Steps

### Step 1: Install Dependencies

```bash
npm install framer-motion lucide-react zod react-hook-form
```

**Already Installed:**
- `framer-motion` - For animations
- `lucide-react` - For icons

**To Install:**
- `zod` - For form validation (already added to package.json)
- `react-hook-form` - For advanced forms (optional)

### Step 2: Verify Tailwind Config

The `tailwind.config.ts` has been updated with the admin color palette. Verify it includes:
- Primary colors (Desert Titanium Orange)
- Neutral colors (Warm grays)
- Semantic colors
- Custom shadows

**File:** `/Users/adityaaman/Desktop/ChatGPTPH/tailwind.config.ts`

### Step 3: Create Admin Routes

Create the following Next.js app router structure:

```
app/
├── admin/
│   ├── layout.tsx           # Admin layout wrapper
│   ├── page.tsx             # Dashboard
│   ├── pages/
│   │   ├── page.tsx         # Pages list
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx # Page editor
│   ├── seo/
│   │   └── page.tsx         # SEO manager
│   ├── faqs/
│   │   └── page.tsx         # FAQ builder
│   ├── media/
│   │   └── page.tsx         # Media library
│   └── settings/
│       └── page.tsx         # Settings
```

### Step 4: Create Admin Layout

**File:** `app/admin/layout.tsx`

```tsx
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### Step 5: Create Dashboard Page

**File:** `app/admin/page.tsx`

```tsx
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat cards */}
        <div className="bg-white p-6 rounded-lg shadow-admin-base border border-neutral-200">
          <div className="text-4xl mb-2">243</div>
          <div className="text-sm text-neutral-600">Total Pages</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-admin-base border border-neutral-200">
          <div className="text-4xl mb-2">8,425</div>
          <div className="text-sm text-neutral-600">Total Visits</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-admin-base border border-neutral-200">
          <div className="text-4xl mb-2">94.2%</div>
          <div className="text-sm text-neutral-600">Uptime</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-admin-base border border-neutral-200">
          <div className="text-4xl mb-2">2m 15s</div>
          <div className="text-sm text-neutral-600">Avg Time</div>
        </div>
      </div>

      {/* Recent pages */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-admin-base border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Pages</h2>
          <a href="/admin/pages" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </a>
        </div>

        <div className="space-y-3">
          {/* Page items */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div>
              <div className="font-medium">Filipino Chat Tool</div>
              <div className="text-sm text-neutral-500">Draft · Nov 15, 2025</div>
            </div>
            <a href="/admin/pages/1/edit" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Edit
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
```

### Step 6: Create Page Editor

**File:** `app/admin/pages/[id]/edit/page.tsx`

```tsx
import AdminLayout from '@/components/admin/AdminLayout';
import PageEditorSplitView from '@/components/admin/PageEditorSplitView';

export default function EditPage({ params }: { params: { id: string } }) {
  const handleSave = async (content: any) => {
    // TODO: Implement API call
    const response = await fetch(`/api/admin/pages/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      throw new Error('Failed to save page');
    }

    return response.json();
  };

  const handlePublish = async (content: any) => {
    // TODO: Implement API call
    const response = await fetch(`/api/admin/pages/${params.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      throw new Error('Failed to publish page');
    }

    return response.json();
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Pages', href: '/admin/pages' },
        { label: 'Edit Page' },
      ]}
    >
      <div className="h-[calc(100vh-200px)]">
        <PageEditorSplitView
          pageId={params.id}
          initialContent={{
            title: '',
            content: '',
            status: 'draft',
          }}
          onSave={handleSave}
          onPublish={handlePublish}
          autosaveInterval={30000}
        />
      </div>
    </AdminLayout>
  );
}
```

### Step 7: Create SEO Manager

**File:** `app/admin/seo/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SEOMetaForm from '@/components/admin/SEOMetaForm';

export default function SEOManager() {
  const [selectedPage, setSelectedPage] = useState('home');

  const handleSEOChange = async (metadata: any) => {
    console.log('SEO metadata updated:', metadata);

    // TODO: Implement API call
    await fetch(`/api/admin/seo/${selectedPage}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });
  };

  return (
    <AdminLayout pageTitle="SEO Manager">
      <div className="max-w-4xl">
        {/* Page selector */}
        <div className="mb-6">
          <label htmlFor="page-select" className="block text-sm font-medium text-neutral-700 mb-2">
            Select Page
          </label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="home">Home Page</option>
            <option value="filipino-chat">Filipino Chat Tool</option>
            <option value="grammar-checker">Grammar Checker</option>
            <option value="about">About Page</option>
          </select>
        </div>

        {/* SEO Form */}
        <div className="bg-white p-6 rounded-lg shadow-admin-base border border-neutral-200">
          <SEOMetaForm
            pageId={selectedPage}
            initialData={{
              title: '',
              description: '',
            }}
            onChange={handleSEOChange}
            showPreview={true}
          />
        </div>

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
            Save SEO Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
```

---

## API Routes to Implement

Create these API endpoints for the admin panel:

### 1. Pages API

**File:** `app/api/admin/pages/route.ts`

```typescript
import { NextResponse } from 'next/server';

// GET /api/admin/pages - List all pages
export async function GET() {
  // TODO: Fetch from database
  const pages = [
    {
      id: '1',
      title: 'Filipino Chat Tool',
      status: 'draft',
      updatedAt: new Date(),
    },
  ];

  return NextResponse.json(pages);
}

// POST /api/admin/pages - Create new page
export async function POST(request: Request) {
  const data = await request.json();

  // TODO: Save to database

  return NextResponse.json({ id: '1', ...data });
}
```

**File:** `app/api/admin/pages/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';

// GET /api/admin/pages/[id] - Get single page
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Fetch from database

  return NextResponse.json({
    id: params.id,
    title: 'Example Page',
    content: 'Page content...',
    status: 'draft',
  });
}

// PATCH /api/admin/pages/[id] - Update page
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();

  // TODO: Update in database

  return NextResponse.json({ id: params.id, ...data });
}

// DELETE /api/admin/pages/[id] - Delete page
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Delete from database

  return NextResponse.json({ success: true });
}
```

### 2. SEO API

**File:** `app/api/admin/seo/[pageId]/route.ts`

```typescript
import { NextResponse } from 'next/server';

// GET /api/admin/seo/[pageId] - Get SEO metadata
export async function GET(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  // TODO: Fetch from database

  return NextResponse.json({
    title: 'ChatGPT Philippines',
    description: 'Free AI chat for Filipinos',
  });
}

// PUT /api/admin/seo/[pageId] - Update SEO metadata
export async function PUT(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  const data = await request.json();

  // TODO: Update in database

  return NextResponse.json({ success: true, data });
}
```

---

## Database Schema

Add these tables to your database:

```sql
-- Pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
  publish_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO metadata table
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT,
  twitter_card TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  noindex BOOLEAN DEFAULT FALSE,
  nofollow BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FAQs table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

---

## Authentication & Authorization

Add admin authentication:

### Option 1: NextAuth.js

```bash
npm install next-auth
```

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Verify credentials
        if (credentials?.username === 'admin' && credentials?.password === 'password') {
          return { id: '1', name: 'Admin', email: 'admin@chatgpt.ph' };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
});

export { handler as GET, handler as POST };
```

### Option 2: Auth0 (Already Installed)

Your project already has `@auth0/nextjs-auth0` installed. Use it to protect admin routes:

**File:** `app/admin/layout.tsx`

```tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  return <>{children}</>;
}
```

---

## Testing Checklist

Before launching:

- [ ] All components render correctly
- [ ] Sidebar opens/closes on mobile
- [ ] Auto-save works in editor
- [ ] SEO validation shows warnings
- [ ] Preview updates in real-time
- [ ] Forms submit successfully
- [ ] API routes return correct data
- [ ] Authentication protects admin routes
- [ ] Keyboard shortcuts work
- [ ] Screen reader navigation works
- [ ] Mobile responsive on 375px width
- [ ] Desktop layout on 1920px width
- [ ] All colors meet WCAG AA contrast
- [ ] Focus indicators visible

---

## Next Steps

1. **Install missing dependencies** (zod, react-hook-form if needed)
2. **Create admin route structure** (`app/admin/`)
3. **Set up authentication** (NextAuth or Auth0)
4. **Implement API routes** for pages, SEO, media
5. **Create database tables** using Supabase
6. **Build remaining components**:
   - FAQBuilder
   - MediaLibraryGrid
   - InternalLinkManager
   - PublishPanel
7. **Add image upload** functionality
8. **Implement search** in media library
9. **Add analytics** dashboard
10. **Deploy** and test in production

---

## Support Files

- **Design Spec**: `/Users/adityaaman/Desktop/ChatGPTPH/ADMIN_PANEL_DESIGN.md`
- **Component Docs**: `/Users/adityaaman/Desktop/ChatGPTPH/components/admin/README.md`
- **Components**:
  - `/Users/adityaaman/Desktop/ChatGPTPH/components/admin/AdminLayout.tsx`
  - `/Users/adityaaman/Desktop/ChatGPTPH/components/admin/PageEditorSplitView.tsx`
  - `/Users/adityaaman/Desktop/ChatGPTPH/components/admin/SEOMetaForm.tsx`
- **Tailwind Config**: `/Users/adityaaman/Desktop/ChatGPTPH/tailwind.config.ts`

---

**Ready to implement!** Start with Step 1 and work your way through. Each component is production-ready and follows Next.js 14 best practices.
