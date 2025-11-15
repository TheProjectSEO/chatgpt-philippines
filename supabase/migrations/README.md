# CMS Database Migrations

Complete database schema migrations for the Next.js + Supabase CMS system with Auth0 integration.

## Overview

This migration set creates a production-ready CMS with:
- **16 database tables** for comprehensive content management
- **Row Level Security (RLS)** policies for Auth0 integration
- **12+ RPC functions** for complex operations
- **Optimized indexes** for query performance
- **Version control** and audit trail
- **Media management** with Supabase Storage
- **SEO optimization** with meta tags and schema markup

## Migration Files

| File | Description | Tables Created |
|------|-------------|----------------|
| `20251116000001_initial_cms_schema.sql` | Core schema with all 16 tables | cms_users, page_types, pages, seo_meta, schema_markup, page_content_blocks, faqs, media_library, internal_links, page_versions, categories, page_categories, content_tags, page_tags, redirects, page_analytics |
| `20251116000002_rls_policies.sql` | Row Level Security policies | N/A (policies only) |
| `20251116000003_rpc_functions.sql` | Remote Procedure Calls | N/A (functions only) |
| `20251116000004_seed_data.sql` | Initial page types, categories, tags | N/A (data only) |
| `20251116000005_storage_setup.sql` | Storage policies and helpers | N/A (storage config) |

## Tables Summary

### Core Tables (16)

1. **cms_users** - CMS user profiles with roles (admin, editor, viewer)
2. **page_types** - Page type definitions (tool_page, blog_post, etc.)
3. **pages** - Main content pages with versioning
4. **seo_meta** - SEO metadata, Open Graph, Twitter Cards
5. **schema_markup** - JSON-LD structured data for SEO
6. **page_content_blocks** - Flexible WYSIWYG content blocks
7. **faqs** - FAQ items with FAQPage schema support
8. **media_library** - Centralized media file management
9. **internal_links** - Internal linking structure for SEO
10. **page_versions** - Full audit trail with snapshots
11. **categories** - Hierarchical category system
12. **page_categories** - Pages-to-categories junction table
13. **content_tags** - Tag definitions for content
14. **page_tags** - Pages-to-tags junction table
15. **redirects** - URL redirect management (301/302)
16. **page_analytics** - Daily page performance tracking

### Key Features

- **Versioning**: Full page history with rollback capability
- **Content Workflow**: Draft → Published → Archived → Scheduled
- **Mobile-First**: Optimized indexes for fast mobile queries
- **SEO Ready**: Meta tags, schema markup, canonical URLs
- **Multi-User**: Role-based access (admin, editor, viewer)
- **Audit Trail**: Track all changes with user attribution

## Installation Methods

### Method 1: Supabase Dashboard (Recommended for First Time)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to SQL Editor

2. **Run Migrations in Order**
   ```
   1. Copy contents of 20251116000001_initial_cms_schema.sql
   2. Paste into SQL Editor
   3. Click "Run"
   4. Repeat for each migration file in order
   ```

3. **Verify Installation**
   ```sql
   -- Check all tables created
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;

   -- Should see 16 tables:
   -- categories, cms_users, content_tags, faqs, internal_links,
   -- media_library, page_analytics, page_categories, page_content_blocks,
   -- page_tags, page_types, page_versions, pages, redirects,
   -- schema_markup, seo_meta
   ```

### Method 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations
supabase db push

# Or run individual migrations
supabase db execute -f supabase/migrations/20251116000001_initial_cms_schema.sql
supabase db execute -f supabase/migrations/20251116000002_rls_policies.sql
supabase db execute -f supabase/migrations/20251116000003_rpc_functions.sql
supabase db execute -f supabase/migrations/20251116000004_seed_data.sql
supabase db execute -f supabase/migrations/20251116000005_storage_setup.sql
```

### Method 3: Direct PostgreSQL Connection

```bash
# Get connection string from Supabase Dashboard > Project Settings > Database

# Run migrations
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f supabase/migrations/20251116000001_initial_cms_schema.sql

psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f supabase/migrations/20251116000002_rls_policies.sql

# Continue for all files...
```

## Post-Migration Steps

### 1. Create Storage Bucket

**Via Dashboard:**
1. Go to Storage section
2. Click "Create Bucket"
3. Name: `media`
4. Public: Yes
5. File size limit: 50MB

**Via CLI:**
```bash
supabase storage create media --public
```

### 2. Create First Admin User

After signing up via Auth0, create CMS user:

```sql
-- Get your auth user ID
SELECT id, email FROM auth.users;

-- Create CMS admin user
SELECT create_cms_user('your-email@example.com', 'Your Name', 'admin');
```

Or manually:
```sql
INSERT INTO public.cms_users (auth_user_id, email, full_name, role)
VALUES (
    'YOUR_AUTH_USER_ID',
    'admin@example.com',
    'Admin User',
    'admin'
);
```

### 3. Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- All tables should show rowsecurity = true
```

### 4. Test RPC Functions

```sql
-- Test page retrieval
SELECT * FROM get_page_by_slug('test-page');

-- Test search
SELECT * FROM search_pages('writing tools');

-- Test sitemap generation
SELECT * FROM get_sitemap_data();
```

### 5. Check Seed Data

```sql
-- Verify page types
SELECT name, display_name FROM page_types;

-- Verify categories
SELECT name, slug FROM categories;

-- Verify tags
SELECT name, slug FROM content_tags;
```

## RPC Functions Reference

### Public Functions (Callable by Anonymous Users)

| Function | Description | Usage |
|----------|-------------|-------|
| `increment_page_views(page_id, date)` | Track page views | Analytics |
| `get_page_by_slug(slug)` | Get complete page data | Frontend |
| `get_related_pages(page_id, limit)` | Find related content | Recommendations |
| `search_pages(query, limit)` | Full-text search | Search |
| `get_sitemap_data()` | Generate sitemap | SEO |
| `get_redirect(from_path)` | Get redirect destination | Middleware |

### Authenticated Functions (Require Login)

| Function | Description | Usage |
|----------|-------------|-------|
| `create_page_version(page_id, user_id, summary)` | Create snapshot | Versioning |
| `restore_page_version(version_id, user_id)` | Rollback page | Versioning |
| `duplicate_page(page_id, new_slug, user_id)` | Copy page | Content |
| `get_page_analytics_summary(page_id, start, end)` | Get analytics | Dashboard |
| `cleanup_orphaned_records()` | Clean database | Maintenance |
| `publish_scheduled_pages()` | Auto-publish | Automation |

## Usage Examples

### Create a New Page

```typescript
// 1. Create page
const { data: page } = await supabase
  .from('pages')
  .insert({
    page_type_id: 'tool_page_id',
    slug: 'new-tool',
    title: 'My New Tool',
    status: 'draft',
    created_by: userId
  })
  .select()
  .single();

// 2. Add SEO meta
await supabase
  .from('seo_meta')
  .insert({
    page_id: page.id,
    meta_title: 'My New Tool - Best AI Tool',
    meta_description: 'Amazing tool description...'
  });

// 3. Add content blocks
await supabase
  .from('page_content_blocks')
  .insert([
    {
      page_id: page.id,
      block_type: 'hero',
      block_data: { title: 'Welcome!', subtitle: 'Try it now' },
      position: 0
    }
  ]);

// 4. Publish
await supabase
  .from('pages')
  .update({ status: 'published', published_at: new Date() })
  .eq('id', page.id);
```

### Retrieve Page for Frontend

```typescript
const { data } = await supabase.rpc('get_page_by_slug', {
  p_slug: 'my-page'
});

// Returns complete page with:
// - page_data
// - seo_data
// - content_blocks
// - faqs_data
// - schema_markup_data
// - categories_data
// - tags_data
```

### Track Page Views

```typescript
// In your page component or API route
await supabase.rpc('increment_page_views', {
  p_page_id: pageId,
  p_date: new Date().toISOString().split('T')[0]
});
```

### Create Page Version Before Edit

```typescript
// Before making changes
const { data: versionId } = await supabase.rpc('create_page_version', {
  p_page_id: pageId,
  p_user_id: userId,
  p_change_summary: 'Updated hero section'
});
```

## Performance Optimization

### Indexes Created

The schema includes **50+ strategic indexes** for:
- Fast slug lookups
- Efficient status filtering
- Quick date-based queries
- GIN indexes for arrays (tags, keywords)
- Composite indexes for common query patterns

### Query Optimization Tips

1. **Always use indexes**: Queries on indexed fields are 10-100x faster
2. **Use RPC functions**: Pre-optimized queries with proper JOINs
3. **Enable connection pooling**: In Supabase Dashboard > Database Settings
4. **Cache at application level**: Use Next.js ISR/caching for frequently accessed pages

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Public**: Can view published content
- **Authenticated**: Can view all content
- **Editors**: Can create and edit content
- **Admins**: Full access to all operations

### Helper Functions

- `is_admin()` - Check if current user is admin
- `is_editor_or_admin()` - Check if user can edit
- `has_cms_access()` - Check if user has CMS access

## Monitoring & Maintenance

### Weekly Tasks

```sql
-- Check for orphaned records
SELECT * FROM cleanup_orphaned_records();

-- Review analytics
SELECT * FROM cms_statistics;
```

### Monthly Tasks

```sql
-- Analyze slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check storage usage
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Migration Fails

```sql
-- Check if tables already exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- If needed, drop all tables and restart (CAUTION - loses data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run migrations
```

### RLS Blocks Queries

```sql
-- Temporarily disable RLS for debugging (NOT for production!)
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;

-- Check your policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Re-enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
```

### Function Not Found

```sql
-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

## Rollback

If you need to undo migrations:

```sql
-- Drop all CMS tables (CAUTION - loses all data!)
DROP TABLE IF EXISTS public.page_analytics CASCADE;
DROP TABLE IF EXISTS public.redirects CASCADE;
DROP TABLE IF EXISTS public.page_tags CASCADE;
DROP TABLE IF EXISTS public.content_tags CASCADE;
DROP TABLE IF EXISTS public.page_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.page_versions CASCADE;
DROP TABLE IF EXISTS public.internal_links CASCADE;
DROP TABLE IF EXISTS public.media_library CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.page_content_blocks CASCADE;
DROP TABLE IF EXISTS public.schema_markup CASCADE;
DROP TABLE IF EXISTS public.seo_meta CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.page_types CASCADE;
DROP TABLE IF EXISTS public.cms_users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS increment_page_views CASCADE;
DROP FUNCTION IF EXISTS get_page_by_slug CASCADE;
-- ... (list all functions)
```

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Schema Reference**: See `database.types.ts` in schema folder
- **Example Code**: See `schema/examples/` directory

## License

MIT License - See project root for details

---

**Migration Version**: 20251116000005
**Last Updated**: November 16, 2025
**Compatible With**: Supabase PostgreSQL 15+, Next.js 14+
