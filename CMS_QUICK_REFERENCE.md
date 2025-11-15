# CMS Quick Reference Card

Essential commands, code snippets, and references for daily development.

## File Locations

```bash
# Database
/supabase/migrations/003_cms_tables.sql

# Types
/lib/cms/types.ts

# Services
/lib/cms/services/page.service.ts
/lib/cms/services/permission.service.ts

# Repositories
/lib/cms/repositories/*.repository.ts

# Server Actions
/lib/cms/actions/*.actions.ts

# Admin Pages
/app/admin/pages/page.tsx
/app/admin/pages/new/page.tsx
/app/admin/pages/[id]/edit/page.tsx

# Components
/components/cms/editor/tiptap-editor.tsx
/components/cms/preview/split-view.tsx

# Public Pages
/app/[slug]/page.tsx
```

## Common Commands

```bash
# Install all CMS dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link react-hook-form @hookform/resolvers/zod @tanstack/react-query

# Run database migration
psql <connection-string> < supabase/migrations/003_cms_tables.sql

# Or with Supabase CLI
npx supabase db push supabase/migrations/003_cms_tables.sql

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Code Snippets

### Create New Page (Server Action)

```typescript
import { createPageAction } from '@/lib/cms/actions/page.actions';

const result = await createPageAction({
  title: 'My Page',
  slug: 'my-page',
  page_type: 'tool',
  content: {
    hero: {
      title: 'Welcome',
      subtitle: 'This is my page'
    }
  },
  status: 'draft'
});

if (result.success) {
  console.log('Page created:', result.data);
}
```

### Fetch Page (Server Component)

```typescript
import { pageService } from '@/lib/cms/services/page.service';

export default async function MyPage() {
  const result = await pageService.getPageBySlug('my-slug');

  if (!result.success) {
    return <div>Error</div>;
  }

  return <div>{result.data.title}</div>;
}
```

### Use Permissions Hook (Client Component)

```typescript
'use client';
import { usePermissions } from '@/lib/cms/hooks/use-permissions';

export function MyComponent() {
  const { canDeletePages, isAdmin } = usePermissions();

  return (
    <div>
      {canDeletePages && <button>Delete</button>}
      {isAdmin && <div>Admin Panel</div>}
    </div>
  );
}
```

### Protected Component

```typescript
import { Protected } from '@/components/cms/protected';

export function AdminActions() {
  return (
    <Protected requirePermission="can_delete_pages">
      <button>Delete Page</button>
    </Protected>
  );
}
```

### Check Permission (Server Action)

```typescript
'use server';
import { requirePermission } from '@/lib/cms/utils/auth';

export async function deletePageAction(id: string) {
  await requirePermission('can_delete_pages');
  // Delete logic here
}
```

### Generate Metadata (SEO)

```typescript
import { pageService } from '@/lib/cms/services/page.service';
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const result = await pageService.getPageBySlug(params.slug);
  const seo = result.data?.seo_metadata;

  return {
    title: seo?.meta_title || result.data?.title,
    description: seo?.meta_description,
    openGraph: {
      title: seo?.og_title || result.data?.title,
      description: seo?.og_description,
      images: seo?.og_image ? [seo.og_image] : [],
    },
  };
}
```

### TipTap Editor Usage

```typescript
import { TipTapEditor } from '@/components/cms/editor/tiptap-editor';

export function MyForm() {
  const [content, setContent] = useState({});

  return (
    <TipTapEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

### Data Table

```typescript
import { DataTable } from '@/components/cms/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<Page>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export function PageList({ pages }) {
  return <DataTable columns={columns} data={pages} />;
}
```

## Database Queries

### Get All Published Pages

```sql
SELECT * FROM pages
WHERE status = 'published'
ORDER BY created_at DESC;
```

### Get Page with SEO

```sql
SELECT p.*, s.*
FROM pages p
LEFT JOIN seo_metadata s ON p.id = s.page_id
WHERE p.slug = 'my-slug';
```

### Get Pages by User

```sql
SELECT * FROM pages
WHERE created_by = 'user-id'
AND status = 'draft';
```

### Grant Admin Access

```sql
INSERT INTO admin_permissions (user_id, role)
VALUES ('auth0-user-id', 'admin');
```

### Check User Permissions

```sql
SELECT * FROM admin_permissions
WHERE user_id = 'auth0-user-id';
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pages` | List pages |
| POST | `/api/admin/pages` | Create page |
| GET | `/api/admin/pages/[id]` | Get page |
| PATCH | `/api/admin/pages/[id]` | Update page |
| DELETE | `/api/admin/pages/[id]` | Delete page |
| POST | `/api/admin/pages/[id]/publish` | Publish page |
| GET | `/api/admin/pages/[id]/preview` | Preview page |
| POST | `/api/admin/media/upload` | Upload media |
| GET | `/api/admin/seo/[page_id]` | Get SEO data |
| PATCH | `/api/admin/seo/[page_id]` | Update SEO |

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Auth0
AUTH0_SECRET=xxx
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://xxx.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
```

## TypeScript Types

```typescript
import {
  Page,
  PageFormData,
  PageWithRelations,
  PageListFilters,
  SEOMetadata,
  FAQ,
  Media,
  AdminPermission,
  APIResponse,
  PaginatedResponse,
} from '@/lib/cms/types';
```

## Validation Schemas

```typescript
import {
  CreatePageSchema,
  UpdatePageSchema,
  BulkUpdateSchema,
  PageFiltersSchema,
} from '@/lib/cms/validation/page.schema';

// Usage
const validData = CreatePageSchema.parse(formData);
```

## Common Patterns

### Server Component with Data Fetching

```typescript
export default async function PageListPage() {
  const result = await pageService.getPages({ status: 'published' });

  if (!result.success) {
    return <ErrorPage />;
  }

  return <PageList pages={result.data.items} />;
}
```

### Client Component with Mutation

```typescript
'use client';
import { useMutation } from '@tanstack/react-query';
import { createPageAction } from '@/lib/cms/actions/page.actions';

export function CreatePageForm() {
  const { mutate, isPending } = useMutation({
    mutationFn: createPageAction,
    onSuccess: () => {
      router.push('/admin/pages');
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutate(formData);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Protected Server Action

```typescript
'use server';
import { requirePermission } from '@/lib/cms/utils/auth';

export async function deletePageAction(id: string) {
  try {
    await requirePermission('can_delete_pages');
    await pageService.deletePage(id);
    revalidatePath('/admin/pages');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Debugging Tips

### Check Auth Status

```typescript
// In Server Component
const session = await getSession();
console.log('User:', session?.user);

// In Client Component
const { user } = useUser();
console.log('User:', user);
```

### Check Permissions

```sql
-- Check if user is admin
SELECT role FROM admin_permissions
WHERE user_id = 'your-user-id';
```

### Check RLS Policies

```sql
-- View all policies on pages table
SELECT * FROM pg_policies
WHERE tablename = 'pages';
```

### Debug API Calls

```typescript
// Check response in browser console
const result = await fetch('/api/admin/pages');
console.log(await result.json());
```

## Performance Tips

1. **Use React Server Components by default**
   - Only use 'use client' when needed
   - Server Components = zero JavaScript

2. **Implement caching**
   ```typescript
   import { cache } from 'react';

   export const getPage = cache(async (id: string) => {
     return await pageService.getPageById(id);
   });
   ```

3. **Use dynamic imports for heavy components**
   ```typescript
   const Editor = dynamic(() => import('./editor'), {
     ssr: false,
     loading: () => <Skeleton />
   });
   ```

4. **Optimize database queries**
   - Use indexes
   - Limit result sets
   - Use pagination

5. **Enable ISR for public pages**
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check Auth0 session and admin_permissions table |
| Permission denied | Verify RLS policies and user role |
| Editor not loading | Check TipTap dependencies and dynamic import |
| Preview not updating | Check postMessage in browser DevTools |
| Slow queries | Add database indexes, check query plan |
| Build errors | Check TypeScript types and import paths |

## Useful Links

- **Next.js Docs**: https://nextjs.org/docs
- **TipTap Docs**: https://tiptap.dev
- **Supabase Docs**: https://supabase.com/docs
- **Auth0 Docs**: https://auth0.com/docs
- **React Query Docs**: https://tanstack.com/query

## Support

For detailed implementation:
- See `CMS_IMPLEMENTATION_GUIDE.md`
- See `CMS_ARCHITECTURE_SUMMARY.md`
- See component-specific `.md` files
