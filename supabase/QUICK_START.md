# CMS Migration Quick Start

## 5-Minute Setup

### Step 1: Run Migrations (2 minutes)

Open Supabase Dashboard → SQL Editor → Paste each file in order:

```
1. 20251116000001_initial_cms_schema.sql   ← Tables & indexes
2. 20251116000002_rls_policies.sql         ← Security
3. 20251116000003_rpc_functions.sql        ← Functions
4. 20251116000004_seed_data.sql            ← Initial data
5. 20251116000005_storage_setup.sql        ← Storage config
```

### Step 2: Create Storage Bucket (30 seconds)

Dashboard → Storage → Create Bucket
- Name: `media`
- Public: ✅ Yes
- File size limit: 50MB

### Step 3: Create Admin User (1 minute)

```sql
-- After signing up via Auth0, run:
SELECT create_cms_user('your-email@example.com', 'Your Name', 'admin');
```

### Step 4: Verify (30 seconds)

```sql
-- Check tables (should show 16)
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';

-- Check seed data
SELECT * FROM page_types;
SELECT * FROM categories;
```

### Step 5: Test (1 minute)

```typescript
// In your Next.js app
const { data } = await supabase.rpc('get_sitemap_data');
console.log('Migration successful!', data);
```

## Done! 🎉

Your CMS is ready. Next steps:
1. Create your first page
2. Configure Auth0 integration
3. Deploy to production

---

## Common Commands

### Create a Page
```typescript
const { data: page } = await supabase
  .from('pages')
  .insert({
    page_type_id: 'uuid-here',
    slug: 'my-page',
    title: 'My Page',
    status: 'draft',
    created_by: userId
  })
  .select()
  .single();
```

### Add SEO Meta
```typescript
await supabase.from('seo_meta').insert({
  page_id: page.id,
  meta_title: 'My Page - Site Name',
  meta_description: 'Page description here...'
});
```

### Get Page by Slug
```typescript
const { data } = await supabase.rpc('get_page_by_slug', {
  p_slug: 'my-page'
});
```

### Track Page View
```typescript
await supabase.rpc('increment_page_views', {
  p_page_id: pageId
});
```

### Search Pages
```typescript
const { data } = await supabase.rpc('search_pages', {
  p_search_query: 'writing tools',
  p_limit: 10
});
```

## User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access - create/edit/delete everything |
| **editor** | Create/edit pages, upload media |
| **viewer** | View all content (read-only) |

## Tables Cheat Sheet

```
cms_users           → User profiles with roles
page_types          → Tool, blog, static, etc.
pages               → Main content pages
seo_meta            → Meta tags, OG, Twitter
schema_markup       → JSON-LD schemas
page_content_blocks → WYSIWYG content
faqs                → FAQ items
media_library       → Uploaded files
internal_links      → Page links
page_versions       → History/rollback
categories          → Content categories
page_categories     → Page ↔ Category
content_tags        → Tag definitions
page_tags           → Page ↔ Tag
redirects           → URL redirects
page_analytics      → Daily metrics
```

## Functions Cheat Sheet

```typescript
// Public (anyone can call)
increment_page_views(page_id, date?)
get_page_by_slug(slug)
get_related_pages(page_id, limit?)
search_pages(query, limit?)
get_sitemap_data()
get_redirect(from_path)

// Authenticated (login required)
create_page_version(page_id, user_id, summary?)
restore_page_version(version_id, user_id)
duplicate_page(page_id, new_slug, user_id)
get_page_analytics_summary(page_id, start_date, end_date)
cleanup_orphaned_records()
publish_scheduled_pages()
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...    # Keep secret!
```

## Troubleshooting

**Migration fails?**
→ Check PostgreSQL version (need 15+)

**RLS blocks queries?**
→ Verify user is in cms_users table

**Storage not working?**
→ Ensure bucket is public and policies applied

**Slow queries?**
→ Use RPC functions, they're optimized

## Support

- **Full Docs**: See `README.md` in migrations folder
- **Schema Reference**: See `MIGRATION_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs

---

**Migration Version**: 20251116000005
**Compatible With**: Supabase PostgreSQL 15+, Next.js 14+
