# CMS Component Architecture

This document details the reusable component architecture for the admin panel.

## Component Hierarchy

```
AdminLayout (Server Component)
├── AdminSidebar (Client Component)
│   ├── Navigation Items
│   ├── Quick Actions
│   └── User Profile
├── AdminHeader (Client Component)
│   ├── Breadcrumbs
│   ├── Search
│   └── Notifications
└── Main Content Area (Server Component)
    ├── Page-specific content
    └── Preview Panel (Client Component)
```

## Core Admin Components

### 1. Admin Layout Components

#### `/app/admin/layout.tsx` (Server Component)
```typescript
import { AdminSidebar } from './components/admin-sidebar';
import { AdminHeader } from './components/admin-header';
import { checkAdminPermissions } from '@/lib/cms/utils/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const session = await getSession();
  if (!session) {
    redirect('/login?returnTo=/admin');
  }

  const hasPermission = await checkAdminPermissions(session.user.id);
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

#### `/app/admin/components/admin-sidebar.tsx` (Client Component)
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Settings,
  Image,
  Link as LinkIcon,
  HelpCircle,
  BarChart,
  Calendar,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: BarChart },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'SEO', href: '/admin/seo', icon: Settings },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Links', href: '/admin/links', icon: LinkIcon },
  { label: 'Scheduled', href: '/admin/scheduled', icon: Calendar },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">CMS</h1>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### 2. Data Table Component (Reusable)

#### `/components/cms/ui/data-table.tsx` (Client Component)
```typescript
'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  enableSelection = false,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  transition-colors
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} results
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Page Form Component

#### `/app/admin/pages/components/page-form.tsx` (Client Component)
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePageSchema, CreatePageInput } from '@/lib/cms/validation/page.schema';
import { createPageAction, updatePageAction } from '@/lib/cms/actions/page.actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/cms/editor/tiptap-editor';

interface PageFormProps {
  initialData?: Partial<CreatePageInput>;
  pageId?: string;
  mode: 'create' | 'edit';
}

export function PageForm({ initialData, pageId, mode }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePageInput>({
    resolver: zodResolver(CreatePageSchema),
    defaultValues: initialData || {
      status: 'draft',
      page_type: 'tool',
      is_indexable: true,
      allow_comments: false,
      is_homepage: false,
    },
  });

  const onSubmit = async (data: CreatePageInput) => {
    setIsSubmitting(true);

    try {
      const result = mode === 'create'
        ? await createPageAction(data)
        : await updatePageAction(pageId!, data);

      if (result.success) {
        router.push('/admin/pages');
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <input
          type="text"
          {...register('slug')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      {/* Page Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Page Type
        </label>
        <select
          {...register('page_type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="tool">Tool</option>
          <option value="home">Home</option>
          <option value="static">Static</option>
          <option value="landing">Landing</option>
        </select>
      </div>

      {/* WYSIWYG Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <TipTapEditor
          content={watch('content')}
          onChange={(content) => setValue('content', content)}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_homepage')} />
          <span className="text-sm text-gray-700">Set as homepage</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_indexable')} />
          <span className="text-sm text-gray-700">Allow search engines to index</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('allow_comments')} />
          <span className="text-sm text-gray-700">Allow comments</span>
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Page' : 'Update Page'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## State Management Strategy

### React Query for Server State

```typescript
// /lib/cms/hooks/use-page.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pageService } from '../services/page.service';

export function usePage(id: string) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => pageService.getPageById(id),
  });
}

export function usePages(filters: PageListFilters) {
  return useQuery({
    queryKey: ['pages', filters],
    queryFn: () => pageService.getPages(filters),
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PageFormData) => createPageAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useUpdatePage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PageFormData>) => updatePageAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', id] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}
```

## Mobile-First Responsive Design

All admin components use Tailwind CSS with mobile-first breakpoints:

```typescript
// Example responsive layout
<div className="
  grid
  grid-cols-1       // Mobile: 1 column
  md:grid-cols-2    // Tablet: 2 columns
  lg:grid-cols-3    // Desktop: 3 columns
  gap-4
">
  {/* Component grid items */}
</div>

// Responsive sidebar
<aside className="
  w-full           // Mobile: full width
  lg:w-64          // Desktop: fixed width
  lg:sticky
  lg:top-0
">
  {/* Sidebar content */}
</aside>
```

## Performance Optimizations

1. **Code Splitting**: Use dynamic imports for heavy components
```typescript
const TipTapEditor = dynamic(() => import('./tiptap-editor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
```

2. **Image Optimization**: Use Next.js Image component
```typescript
import Image from 'next/image';

<Image
  src={page.featured_image_url}
  alt={page.title}
  width={800}
  height={400}
  className="rounded-lg"
  priority
/>
```

3. **Debounced Search**: Implement search with debounce
```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 500);

useEffect(() => {
  // Trigger search with debounced value
  refetch({ search: debouncedSearch });
}, [debouncedSearch]);
```

4. **Virtual Scrolling**: For long lists, use react-virtual
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: pages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

## Accessibility Considerations

- All form inputs have proper labels
- Keyboard navigation support
- ARIA attributes for screen readers
- Focus management for modals
- Proper heading hierarchy
- Color contrast compliance (WCAG AA)

## Component Testing Strategy

```typescript
// Example test for PageForm
import { render, screen, fireEvent } from '@testing-library/react';
import { PageForm } from './page-form';

describe('PageForm', () => {
  it('should validate required fields', async () => {
    render(<PageForm mode="create" />);

    const submitButton = screen.getByText('Create Page');
    fireEvent.click(submitButton);

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
```
