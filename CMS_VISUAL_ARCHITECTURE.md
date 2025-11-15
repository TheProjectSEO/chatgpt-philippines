# CMS Visual Architecture Diagrams

Visual representations of the CMS system architecture.

## 1. Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER INTERACTIONS                                 │
├──────────────────────────────┬──────────────────────────────────────────────┤
│      Public Visitors         │           Admin Users                        │
│   (Read-only access)         │      (Content Management)                    │
└──────────────┬───────────────┴───────────────┬──────────────────────────────┘
               │                               │
               ↓                               ↓
┌──────────────────────────┐   ┌──────────────────────────────────────────────┐
│   Public Frontend        │   │      Admin Dashboard                          │
│   ================       │   │      =================                         │
│   - Dynamic [slug] pages │   │   ┌──────────────────┬────────────────────┐  │
│   - SEO optimized        │   │   │   Sidebar Nav    │   Main Content     │  │
│   - Fast page loads      │   │   │   ============   │   =============    │  │
│   - Mobile responsive    │   │   │   - Dashboard    │   - Page List      │  │
│   - Accessible           │   │   │   - Pages        │   - Editor         │  │
│                          │   │   │   - SEO          │   - SEO Tools      │  │
│                          │   │   │   - FAQs         │   - Media Library  │  │
│                          │   │   │   - Media        │   - Preview        │  │
│                          │   │   │   - Links        │                    │  │
│                          │   │   │   - Settings     │                    │  │
│                          │   │   └──────────────────┴────────────────────┘  │
└──────────────┬───────────┘   └───────────────────┬──────────────────────────┘
               │                                   │
               │                                   │
               ↓                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION LAYER                                 │
│                         ===================                                  │
│   ┌────────────────┐           ┌──────────────────┐                         │
│   │ Public: None   │           │ Admin: Auth0 +   │                         │
│   │ required       │           │ Permissions      │                         │
│   └────────────────┘           └──────────────────┘                         │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MIDDLEWARE LAYER                                  │
│                            ================                                  │
│   - Route protection                                                         │
│   - Session validation                                                       │
│   - Permission checking                                                      │
│   - Rate limiting                                                            │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│                           =================                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Server Components│  │   API Routes     │  │ Server Actions   │          │
│  │ ================│  │   ==========     │  │ ==============   │          │
│  │ - Page renderer  │  │   - RESTful APIs │  │ - Mutations      │          │
│  │ - SEO injection  │  │   - File uploads │  │ - Form handling  │          │
│  │ - Data fetching  │  │   - Preview gen  │  │ - Revalidation   │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                      │                     │
│           └─────────────────────┼──────────────────────┘                     │
│                                 │                                             │
│                                 ↓                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      BUSINESS LOGIC LAYER                              │  │
│  │                      ====================                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Services  │  │Repositories │  │ Validation  │  │   Utils     │  │  │
│  │  │ ==========  │  │ =========== │  │ ==========  │  │ ========    │  │  │
│  │  │ - Page      │  │ - Page      │  │ - Zod       │  │ - Slug gen  │  │  │
│  │  │ - SEO       │  │ - SEO       │  │ - Schemas   │  │ - SEO score │  │  │
│  │  │ - Media     │  │ - FAQ       │  │ - Sanitize  │  │ - Image opt │  │  │
│  │  │ - Permission│  │ - Media     │  │             │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS LAYER                                 │
│                            ================                                  │
│   ┌──────────────────┐        ┌──────────────────┐                          │
│   │ Supabase Client  │        │  React Query     │                          │
│   │ ===============  │        │  ============    │                          │
│   │ - CRUD queries   │        │  - Caching       │                          │
│   │ - RLS policies   │        │  - Optimistic UI │                          │
│   │ - Real-time      │        │  - Invalidation  │                          │
│   └──────────────────┘        └──────────────────┘                          │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE POSTGRESQL                                  │
│                         ==================                                   │
│  ┌────────────┐ ┌──────────────┐ ┌───────┐ ┌──────────────┐               │
│  │   pages    │ │ seo_metadata │ │  faqs │ │    media     │               │
│  └────────────┘ └──────────────┘ └───────┘ └──────────────┘               │
│                                                                              │
│  ┌──────────────┐ ┌────────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  components  │ │  revisions     │ │  links       │ │  scheduled   │    │
│  └──────────────┘ └────────────────┘ └──────────────┘ └──────────────┘    │
│                                                                              │
│  ┌──────────────┐                                                           │
│  │ permissions  │                                                           │
│  └──────────────┘                                                           │
│                                                                              │
│  Features: Row Level Security (RLS), JSONB, Full-text Search, Indexes      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow: Creating a Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User fills form in Admin Panel                                  │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Client-side validation (React Hook Form + Zod)                  │
│   - Required fields check                                                │
│   - Format validation                                                    │
│   - Slug format check                                                    │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ Valid ✓
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Server Action called (createPageAction)                         │
│   - Server-side re-validation                                           │
│   - Authentication check                                                 │
│   - Permission check (can_create_pages)                                  │
│   - Rate limit check                                                     │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ Authorized ✓
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: PageService.createPage()                                        │
│   - Generate slug if not provided                                       │
│   - Check slug uniqueness                                               │
│   - Prepare data for database                                           │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: PageRepository.create()                                         │
│   - Insert into pages table                                             │
│   - RLS policy check (can user create?)                                 │
│   - Return created page                                                  │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ Page created ✓
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: Create initial revision                                         │
│   - RevisionRepository.create()                                         │
│   - Save snapshot of content                                            │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 7: Cache invalidation & revalidation                               │
│   - React Query: invalidate 'pages' query                               │
│   - Next.js: revalidatePath('/admin/pages')                             │
│   - If published: revalidatePath('/[slug]')                             │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 8: Success response to client                                      │
│   - Return page data                                                     │
│   - Show success notification                                           │
│   - Redirect to pages list                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Admin Panel Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌─────────────────────────────────────────────┐│
│  │              │  │        Top Header Bar                        ││
│  │              │  │  ┌────────────┐          ┌──────────────┐   ││
│  │              │  │  │Breadcrumbs │          │ User Profile │   ││
│  │   Sidebar    │  │  └────────────┘          └──────────────┘   ││
│  │   =======    │  └─────────────────────────────────────────────┘│
│  │              │                                                  │
│  │  Dashboard   │  ┌─────────────────────────────────────────────┐│
│  │  Pages       │  │                                              ││
│  │  SEO         │  │         Main Content Area                    ││
│  │  FAQs        │  │         =================                    ││
│  │  Media       │  │                                              ││
│  │  Links       │  │  ┌────────────────────────────────────────┐ ││
│  │  Scheduled   │  │  │                                         │ ││
│  │  Analytics   │  │  │   Page-specific content loads here      │ ││
│  │  Settings    │  │  │   (List, Form, Editor, etc.)            │ ││
│  │              │  │  │                                         │ ││
│  │              │  │  │                                         │ ││
│  │              │  │  │                                         │ ││
│  │              │  │  │                                         │ ││
│  │              │  │  │                                         │ ││
│  │              │  │  └────────────────────────────────────────┘ ││
│  │              │  │                                              ││
│  └──────────────┘  └─────────────────────────────────────────────┘│
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## 4. Split-View Editor Layout

```
┌────────────────────────────────────────────────────────────────────┐
│                      Edit Page: "My Tool"                           │
├────────────────────────────────────────────────────────────────────┤
│  Device: [Desktop] [Tablet] [Mobile]    [Preview] [Sync Scroll]   │
├────────────────────────────────┬───────────────────────────────────┤
│                                │                                    │
│    WYSIWYG Editor              │     Live Preview                   │
│    =============               │     ============                   │
│                                │                                    │
│  ┌──────────────────────────┐ │  ┌──────────────────────────────┐ │
│  │ Toolbar                  │ │  │                               │ │
│  │ [B][I][U][H1][H2][Link]  │ │  │   ┌───────────────────────┐  │ │
│  └──────────────────────────┘ │  │   │                       │  │ │
│                                │  │   │   Preview rendering   │  │ │
│  ┌──────────────────────────┐ │  │   │   in iframe           │  │ │
│  │                          │ │  │   │                       │  │ │
│  │  # Welcome to My Tool    │ │  │   │   Welcome to My Tool  │  │
│  │                          │ │  │   │                       │  │ │
│  │  This is a paragraph     │ │  │   │   This is a paragraph │  │ │
│  │  with **bold** text.     │ │  │   │   with bold text.     │  │ │
│  │                          │◄─┼──┼───│                       │  │ │
│  │  - List item 1           │ │  │   │   • List item 1       │  │ │
│  │  - List item 2           │ │  │   │   • List item 2       │  │ │
│  │                          │ │  │   │                       │  │ │
│  │  [cursor]                │ │  │   │                       │  │ │
│  │                          │ │  │   │                       │  │ │
│  │                          │ │  │   │                       │  │ │
│  │                          │ │  │   └───────────────────────┘  │ │
│  └──────────────────────────┘ │  │                               │ │
│                                │  └──────────────────────────────┘ │
│  [Save Draft] [Publish]        │                                    │
│                                │                                    │
└────────────────────────────────┴───────────────────────────────────┘
       Real-time sync via postMessage →
```

## 5. Permission System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Attempts Action                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  Is user logged in?  │
              └──────────┬───────────┘
                         │ Yes
                         ↓
              ┌──────────────────────┐
              │ Check admin_         │
              │ permissions table    │
              └──────────┬───────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ↓                             ↓
    ┌─────────┐                  ┌─────────┐
    │  Role   │                  │Specific │
    │  Check  │                  │Permission│
    └────┬────┘                  └────┬────┘
         │                            │
         │ Super Admin? ────Yes───────┤
         │ Admin?       ────Yes───────┤
         │ Editor?      ────Yes───────┤
         │ Viewer?      ────Limited───┤
         │                            │
         ↓                            ↓
    ┌─────────────────────────────────────┐
    │     Check specific permission        │
    │  (can_create_pages, can_delete, etc) │
    └──────────────┬──────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ↓ Allowed                 ↓ Denied
┌─────────────┐           ┌─────────────┐
│ Execute     │           │   Return    │
│ Action      │           │   Error     │
└─────────────┘           └─────────────┘
```

## 6. Database Table Relationships

```
┌──────────────┐
│    users     │
│  (Auth0)     │
└──────┬───────┘
       │
       │ 1:1
       │
       ↓
┌──────────────────┐
│admin_permissions │ ← Role & permission flags
└──────┬───────────┘
       │
       │ 1:N
       │
       ↓
┌──────────────┐
│    pages     │ ← Core content
└──────┬───────┘
       │
       ├──→ 1:1  ┌──────────────┐
       │         │ seo_metadata │ ← SEO settings
       │         └──────────────┘
       │
       ├──→ 1:N  ┌──────────────┐
       │         │     faqs     │ ← Questions/Answers
       │         └──────────────┘
       │
       ├──→ 1:N  ┌──────────────────┐
       │         │ page_components  │ ← Modular sections
       │         └──────────────────┘
       │
       ├──→ 1:N  ┌──────────────────┐
       │         │ page_revisions   │ ← Version history
       │         └──────────────────┘
       │
       ├──→ N:N  ┌──────────────────┐
       │         │ internal_links   │ ← Page connections
       │         └──────────────────┘
       │
       └──→ 1:N  ┌──────────────────┐
                 │scheduled_publishes│ ← Auto-publish queue
                 └──────────────────┘

┌──────────────┐
│    media     │ ← File library (independent)
└──────────────┘
```

## 7. Component Hierarchy

```
App Root
│
├── Public Routes
│   ├── Home (/)
│   ├── [slug] (Dynamic pages)
│   │   ├── Page Component
│   │   ├── SEO metadata
│   │   ├── Hero Section
│   │   ├── Content Sections
│   │   └── FAQ Section
│   │
│   └── Static Routes
│       ├── Login
│       └── Unauthorized
│
└── Admin Routes (/admin)
    ├── AdminLayout
    │   ├── AdminSidebar (Client)
    │   ├── AdminHeader (Client)
    │   └── Main Content
    │
    ├── Dashboard (/admin)
    │   └── DashboardStats
    │
    ├── Pages (/admin/pages)
    │   ├── PageList (Server)
    │   │   └── DataTable (Client)
    │   ├── NewPage (/admin/pages/new)
    │   │   └── PageForm (Client)
    │   │       └── TipTapEditor (Client)
    │   └── EditPage (/admin/pages/[id]/edit)
    │       ├── SplitView (Client)
    │       ├── TipTapEditor (Client)
    │       └── PreviewFrame (Client)
    │
    ├── SEO (/admin/seo)
    │   └── SEOForm (Client)
    │       └── SEOPreview (Client)
    │
    ├── Media (/admin/media)
    │   ├── MediaGrid (Client)
    │   └── MediaUploader (Client)
    │
    └── Settings (/admin/settings)
        └── PermissionEditor (Client)
```

## 8. Request/Response Cycle

```
User visits /my-tool-page
        │
        ↓
Next.js Router (App Router)
        │
        ↓
/app/[slug]/page.tsx (Server Component)
        │
        ↓
generateMetadata() ─────→ Fetch SEO data ─────→ Return metadata
        │
        ↓
Page Component renders
        │
        ├──→ pageService.getPageBySlug('my-tool-page')
        │           │
        │           ↓
        │    PageRepository.findBySlug()
        │           │
        │           ↓
        │    Supabase query (RLS check)
        │           │
        │           ↓
        │    Return page + relations
        │
        ├──→ Render content
        ├──→ Render FAQs
        └──→ Inject structured data
                │
                ↓
        HTML sent to browser
                │
                ↓
        Client hydration
                │
                ↓
        Interactive components mount
```

---

These diagrams provide a complete visual understanding of how the CMS system works from multiple perspectives.
