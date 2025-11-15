# CMS Complete Folder Structure

This document outlines the complete folder structure for the WordPress-like CMS system.

## Directory Tree

```
/Users/adityaaman/Desktop/ChatGPTPH/
├── app/
│   ├── admin/                          # Admin dashboard (protected routes)
│   │   ├── layout.tsx                  # Admin shell layout with sidebar
│   │   ├── page.tsx                    # Dashboard overview
│   │   │
│   │   ├── pages/                      # Pages management
│   │   │   ├── page.tsx                # List all pages (data table)
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create new page form
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # View page details
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx        # Edit page (WYSIWYG)
│   │   │   │   ├── seo/
│   │   │   │   │   └── page.tsx        # SEO settings for page
│   │   │   │   ├── revisions/
│   │   │   │   │   └── page.tsx        # View revision history
│   │   │   │   └── preview/
│   │   │   │       └── page.tsx        # Preview page
│   │   │   └── components/
│   │   │       ├── page-list.tsx       # Client component: page table
│   │   │       ├── page-filters.tsx    # Client component: filters
│   │   │       ├── page-form.tsx       # Client component: create/edit form
│   │   │       ├── wysiwyg-editor.tsx  # Client component: TipTap editor
│   │   │       └── page-status-badge.tsx
│   │   │
│   │   ├── seo/                        # SEO management
│   │   │   ├── page.tsx                # SEO overview dashboard
│   │   │   ├── bulk-edit/
│   │   │   │   └── page.tsx            # Bulk SEO editing
│   │   │   ├── schemas/
│   │   │   │   └── page.tsx            # Schema.org templates
│   │   │   └── components/
│   │   │       ├── seo-form.tsx        # SEO metadata form
│   │   │       ├── seo-preview.tsx     # Google/Twitter preview
│   │   │       ├── seo-analyzer.tsx    # SEO score calculator
│   │   │       └── schema-builder.tsx  # Schema.org builder
│   │   │
│   │   ├── faqs/                       # FAQ management
│   │   │   ├── page.tsx                # List all FAQs
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create FAQ
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx        # Edit FAQ
│   │   │   └── components/
│   │   │       ├── faq-list.tsx        # FAQ table
│   │   │       ├── faq-form.tsx        # FAQ form
│   │   │       └── faq-reorder.tsx     # Drag-drop reordering
│   │   │
│   │   ├── media/                      # Media library
│   │   │   ├── page.tsx                # Media grid/list view
│   │   │   ├── upload/
│   │   │   │   └── page.tsx            # Bulk upload interface
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            # Media details & edit
│   │   │   └── components/
│   │   │       ├── media-grid.tsx      # Grid view
│   │   │       ├── media-uploader.tsx  # Upload component
│   │   │       ├── media-editor.tsx    # Crop, resize, optimize
│   │   │       ├── media-picker.tsx    # Modal picker for pages
│   │   │       └── media-filters.tsx   # Filter/search
│   │   │
│   │   ├── links/                      # Internal link management
│   │   │   ├── page.tsx                # Link dashboard
│   │   │   ├── broken/
│   │   │   │   └── page.tsx            # Broken links report
│   │   │   └── components/
│   │   │       ├── link-table.tsx      # Links table
│   │   │       └── link-checker.tsx    # Link validation
│   │   │
│   │   ├── scheduled/                  # Scheduled publishes
│   │   │   ├── page.tsx                # Upcoming schedules
│   │   │   └── components/
│   │   │       └── schedule-calendar.tsx
│   │   │
│   │   ├── analytics/                  # CMS analytics
│   │   │   ├── page.tsx                # Analytics dashboard
│   │   │   └── components/
│   │   │       ├── page-views-chart.tsx
│   │   │       └── top-pages.tsx
│   │   │
│   │   ├── settings/                   # CMS settings
│   │   │   ├── page.tsx                # General settings
│   │   │   ├── templates/
│   │   │   │   └── page.tsx            # Page templates
│   │   │   ├── users/
│   │   │   │   └── page.tsx            # User permissions
│   │   │   └── components/
│   │   │       ├── settings-form.tsx
│   │   │       └── permission-editor.tsx
│   │   │
│   │   └── components/                 # Shared admin components
│   │       ├── admin-sidebar.tsx       # Navigation sidebar
│   │       ├── admin-header.tsx        # Top bar with user menu
│   │       ├── breadcrumbs.tsx         # Breadcrumb navigation
│   │       ├── quick-actions.tsx       # Floating action button
│   │       ├── notifications.tsx       # Toast notifications
│   │       └── preview-panel.tsx       # Split-view preview
│   │
│   ├── api/                            # API routes
│   │   ├── admin/
│   │   │   ├── pages/
│   │   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET, PATCH, DELETE
│   │   │   │       ├── publish/
│   │   │   │       │   └── route.ts    # POST (publish page)
│   │   │   │       ├── duplicate/
│   │   │   │       │   └── route.ts    # POST (duplicate page)
│   │   │   │       └── restore/
│   │   │   │           └── route.ts    # POST (restore revision)
│   │   │   │
│   │   │   ├── seo/
│   │   │   │   └── [page_id]/
│   │   │   │       ├── route.ts        # GET, PATCH
│   │   │   │       └── analyze/
│   │   │   │           └── route.ts    # POST (SEO analysis)
│   │   │   │
│   │   │   ├── faqs/
│   │   │   │   ├── route.ts            # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET, PATCH, DELETE
│   │   │   │       └── reorder/
│   │   │   │           └── route.ts    # POST (reorder FAQs)
│   │   │   │
│   │   │   ├── media/
│   │   │   │   ├── route.ts            # GET (list)
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts        # POST (upload files)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET, PATCH, DELETE
│   │   │   │       └── optimize/
│   │   │   │           └── route.ts    # POST (optimize image)
│   │   │   │
│   │   │   ├── links/
│   │   │   │   ├── route.ts            # GET (list links)
│   │   │   │   ├── check/
│   │   │   │   │   └── route.ts        # POST (check broken links)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET, PATCH, DELETE
│   │   │   │
│   │   │   ├── revisions/
│   │   │   │   └── [page_id]/
│   │   │   │       └── route.ts        # GET (list revisions)
│   │   │   │
│   │   │   ├── scheduled/
│   │   │   │   ├── route.ts            # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # GET, PATCH, DELETE
│   │   │   │
│   │   │   └── analytics/
│   │   │       └── dashboard/
│   │   │           └── route.ts        # GET (dashboard stats)
│   │   │
│   │   └── public/
│   │       └── pages/
│   │           └── [slug]/
│   │               └── route.ts        # GET (public page data)
│   │
│   ├── [slug]/                         # Dynamic public pages
│   │   └── page.tsx                    # Render page from CMS
│   │
│   └── (existing routes...)
│
├── lib/
│   ├── cms/
│   │   ├── types.ts                    # All CMS TypeScript types
│   │   ├── services/                   # Business logic layer
│   │   │   ├── page.service.ts         # Page CRUD operations
│   │   │   ├── seo.service.ts          # SEO metadata operations
│   │   │   ├── faq.service.ts          # FAQ operations
│   │   │   ├── media.service.ts        # Media upload/management
│   │   │   ├── component.service.ts    # Component registry
│   │   │   ├── revision.service.ts     # Version control
│   │   │   ├── link.service.ts         # Internal link management
│   │   │   ├── schedule.service.ts     # Scheduled publishes
│   │   │   └── analytics.service.ts    # CMS analytics
│   │   │
│   │   ├── repositories/               # Data access layer
│   │   │   ├── page.repository.ts      # Supabase queries for pages
│   │   │   ├── seo.repository.ts       # Supabase queries for SEO
│   │   │   ├── faq.repository.ts       # Supabase queries for FAQs
│   │   │   ├── media.repository.ts     # Supabase queries for media
│   │   │   └── base.repository.ts      # Base repository class
│   │   │
│   │   ├── validation/                 # Zod schemas
│   │   │   ├── page.schema.ts          # Page validation schemas
│   │   │   ├── seo.schema.ts           # SEO validation schemas
│   │   │   ├── faq.schema.ts           # FAQ validation schemas
│   │   │   └── media.schema.ts         # Media validation schemas
│   │   │
│   │   ├── utils/                      # Utility functions
│   │   │   ├── slug.ts                 # Slug generation/validation
│   │   │   ├── seo-analyzer.ts         # SEO score calculation
│   │   │   ├── image-optimizer.ts      # Image optimization
│   │   │   ├── schema-generator.ts     # Schema.org generation
│   │   │   └── link-checker.ts         # Link validation
│   │   │
│   │   ├── hooks/                      # React hooks for CMS
│   │   │   ├── use-page.ts             # Page CRUD hooks
│   │   │   ├── use-seo.ts              # SEO hooks
│   │   │   ├── use-media.ts            # Media library hooks
│   │   │   ├── use-preview.ts          # Preview panel hooks
│   │   │   └── use-autosave.ts         # Auto-save functionality
│   │   │
│   │   ├── constants/
│   │   │   ├── page-templates.ts       # Page template definitions
│   │   │   ├── component-registry.ts   # Available components
│   │   │   └── default-seo.ts          # Default SEO values
│   │   │
│   │   └── actions/                    # Server Actions
│   │       ├── page.actions.ts         # Page mutations
│   │       ├── seo.actions.ts          # SEO mutations
│   │       ├── faq.actions.ts          # FAQ mutations
│   │       ├── media.actions.ts        # Media mutations
│   │       └── schedule.actions.ts     # Schedule mutations
│   │
│   └── (existing files...)
│
├── components/
│   ├── cms/                            # CMS-specific components
│   │   ├── editor/                     # WYSIWYG editor components
│   │   │   ├── tiptap-editor.tsx       # Main TipTap editor
│   │   │   ├── toolbar.tsx             # Editor toolbar
│   │   │   ├── bubble-menu.tsx         # Floating formatting menu
│   │   │   ├── slash-commands.tsx      # / command palette
│   │   │   ├── extensions/             # Custom TipTap extensions
│   │   │   │   ├── image-upload.ts
│   │   │   │   ├── internal-link.ts
│   │   │   │   ├── callout.ts
│   │   │   │   └── component-block.ts
│   │   │   └── nodes/                  # Custom node definitions
│   │   │       ├── hero-block.tsx
│   │   │       ├── faq-block.tsx
│   │   │       └── cta-block.tsx
│   │   │
│   │   ├── preview/                    # Preview system
│   │   │   ├── preview-frame.tsx       # iframe wrapper
│   │   │   ├── device-selector.tsx     # Desktop/tablet/mobile
│   │   │   ├── preview-toolbar.tsx     # Preview controls
│   │   │   └── split-view.tsx          # Side-by-side editor/preview
│   │   │
│   │   ├── page-builder/               # Visual page builder
│   │   │   ├── builder.tsx             # Main builder component
│   │   │   ├── component-palette.tsx   # Drag-drop components
│   │   │   ├── component-settings.tsx  # Component config panel
│   │   │   └── canvas.tsx              # Drop zone
│   │   │
│   │   ├── seo/                        # SEO components
│   │   │   ├── seo-preview.tsx         # Google/Twitter preview
│   │   │   ├── seo-score.tsx           # Score display
│   │   │   ├── meta-tags-editor.tsx    # Meta tag inputs
│   │   │   └── schema-editor.tsx       # Schema.org editor
│   │   │
│   │   └── ui/                         # Reusable UI components
│   │       ├── data-table.tsx          # Generic data table
│   │       ├── file-uploader.tsx       # Drag-drop file upload
│   │       ├── color-picker.tsx        # Color picker
│   │       ├── icon-picker.tsx         # Icon selector
│   │       ├── tag-input.tsx           # Tag management
│   │       ├── rich-select.tsx         # Enhanced select
│   │       └── status-badge.tsx        # Status indicators
│   │
│   └── (existing components...)
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_chats_and_messages.sql
│       └── 003_cms_tables.sql          # NEW: CMS tables
│
└── middleware.ts                       # Auth middleware for admin routes
```

## Route Structure

### Public Routes
- `/` - Homepage
- `/[slug]` - Dynamic CMS pages (e.g., `/paraphraser`, `/about-us`)

### Admin Routes (Protected)
- `/admin` - Dashboard
- `/admin/pages` - Page list
- `/admin/pages/new` - Create page
- `/admin/pages/[id]` - Page details
- `/admin/pages/[id]/edit` - Edit page
- `/admin/pages/[id]/seo` - SEO settings
- `/admin/pages/[id]/revisions` - Revision history
- `/admin/seo` - SEO overview
- `/admin/faqs` - FAQ management
- `/admin/media` - Media library
- `/admin/links` - Internal links
- `/admin/scheduled` - Scheduled publishes
- `/admin/analytics` - Analytics
- `/admin/settings` - CMS settings

### API Routes
- `GET /api/admin/pages` - List pages
- `POST /api/admin/pages` - Create page
- `GET /api/admin/pages/[id]` - Get page
- `PATCH /api/admin/pages/[id]` - Update page
- `DELETE /api/admin/pages/[id]` - Delete page
- `POST /api/admin/pages/[id]/publish` - Publish page
- `POST /api/admin/media/upload` - Upload media
- `POST /api/admin/seo/[page_id]/analyze` - Analyze SEO

## Key Architectural Patterns

### 1. **Server/Client Component Separation**
- **Server Components**: Data fetching, layouts, static content
- **Client Components**: Interactive forms, WYSIWYG editor, real-time preview

### 2. **Data Access Pattern**
```
Component → Hook → Service → Repository → Supabase
```

### 3. **State Management**
- **React Query**: Server state, caching, optimistic updates
- **Zustand** (optional): Complex UI state (editor, preview)
- **React Hook Form**: Form state

### 4. **File Organization Principles**
- **Colocation**: Group related files together
- **Feature-based**: Organize by CMS feature (pages, seo, media)
- **Layered architecture**: Clear separation of concerns
- **DRY**: Shared utilities and components

### 5. **Naming Conventions**
- **Files**: kebab-case (e.g., `page-list.tsx`)
- **Components**: PascalCase (e.g., `PageList`)
- **Utilities**: camelCase (e.g., `generateSlug`)
- **Types**: PascalCase (e.g., `PageFormData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_TEMPLATE`)

## Integration with Existing Codebase

The CMS system integrates seamlessly with your existing ChatGPT Philippines project:

1. **Existing tool pages** (e.g., `/paraphraser`) can be migrated to CMS-managed pages
2. **Supabase tables** extend the existing schema
3. **API routes** follow the same `/api` pattern
4. **Authentication** uses the existing Auth0 system
5. **Components** can be reused (e.g., your existing UI components)

## Next Steps

1. Set up admin authentication middleware
2. Create base admin layout with sidebar
3. Implement page CRUD operations
4. Integrate TipTap editor
5. Build preview system
6. Add SEO management
7. Implement media library
