# CMS Authentication & Permission System

Complete authentication and role-based access control (RBAC) implementation for the admin panel.

## Architecture Overview

```
User Request → Middleware → Auth Check → Permission Check → Admin Panel
                   ↓              ↓               ↓
               Auth0        Supabase        admin_permissions
              Session         RLS              table
```

## Middleware Setup

### `/middleware.ts`

```typescript
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(
  req: NextRequest
) {
  const pathname = req.nextUrl.pathname;

  // Skip auth for public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/login') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    try {
      const session = await getSession(req);

      if (!session || !session.user) {
        // Redirect to login
        const loginUrl = new URL('/api/auth/login', req.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check admin permissions
      const hasAdminAccess = await checkAdminPermissions(session.user.sub);

      if (!hasAdminAccess) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.redirect(new URL('/error', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

async function checkAdminPermissions(userId: string): Promise<boolean> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data, error } = await supabase
      .from('admin_permissions')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    // Check if user has admin role
    return ['super_admin', 'admin', 'editor'].includes(data.role);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}
```

## Permission Service

### `/lib/cms/services/permission.service.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { AdminPermission } from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class PermissionService {
  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permission: keyof AdminPermission
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select(permission)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data[permission] === true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Check if user has required role
   */
  async hasRole(
    userId: string,
    requiredRoles: string[]
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return requiredRoles.includes(data.role);
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<AdminPermission | null> {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return null;
      }

      return data as AdminPermission;
    } catch (error) {
      console.error('Get permissions error:', error);
      return null;
    }
  }

  /**
   * Grant admin access to user
   */
  async grantAdminAccess(
    userId: string,
    role: 'super_admin' | 'admin' | 'editor' | 'viewer' = 'editor'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_permissions')
        .upsert({
          user_id: userId,
          role,
          can_create_pages: true,
          can_edit_pages: true,
          can_delete_pages: role !== 'viewer',
          can_publish_pages: role !== 'viewer',
          can_manage_seo: true,
          can_manage_media: true,
          can_manage_users: role === 'super_admin',
        });

      return !error;
    } catch (error) {
      console.error('Grant access error:', error);
      return false;
    }
  }

  /**
   * Revoke admin access
   */
  async revokeAdminAccess(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Revoke access error:', error);
      return false;
    }
  }

  /**
   * Update user permissions
   */
  async updatePermissions(
    userId: string,
    permissions: Partial<AdminPermission>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_permissions')
        .update(permissions)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Update permissions error:', error);
      return false;
    }
  }

  /**
   * Check rate limit for user
   */
  async checkRateLimit(userId: string): Promise<boolean> {
    try {
      const { data: permissions } = await supabase
        .from('admin_permissions')
        .select('max_pages_per_day')
        .eq('user_id', userId)
        .single();

      if (!permissions) {
        return true; // No limit if no permissions found
      }

      // Count pages created today
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('pages')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .gte('created_at', today);

      return (count || 0) < permissions.max_pages_per_day;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
  }
}

export const permissionService = new PermissionService();
```

## Permission Hooks

### `/lib/cms/hooks/use-permissions.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { permissionService } from '../services/permission.service';
import { useUser } from '@auth0/nextjs-auth0/client';

export function usePermissions() {
  const { user } = useUser();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', user?.sub],
    queryFn: () => {
      if (!user?.sub) return null;
      return permissionService.getUserPermissions(user.sub);
    },
    enabled: !!user?.sub,
  });

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return permissions[permission as keyof typeof permissions] === true;
  };

  const hasRole = (roles: string[]): boolean => {
    if (!permissions) return false;
    return roles.includes(permissions.role);
  };

  const isSuperAdmin = hasRole(['super_admin']);
  const isAdmin = hasRole(['super_admin', 'admin']);
  const isEditor = hasRole(['super_admin', 'admin', 'editor']);

  return {
    permissions,
    isLoading,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isEditor,
    canCreatePages: hasPermission('can_create_pages'),
    canEditPages: hasPermission('can_edit_pages'),
    canDeletePages: hasPermission('can_delete_pages'),
    canPublishPages: hasPermission('can_publish_pages'),
    canManageSEO: hasPermission('can_manage_seo'),
    canManageMedia: hasPermission('can_manage_media'),
    canManageUsers: hasPermission('can_manage_users'),
  };
}
```

## Protected Components

### `/components/cms/protected.tsx`

```typescript
'use client';

import { usePermissions } from '@/lib/cms/hooks/use-permissions';
import { ReactNode } from 'react';

interface ProtectedProps {
  children: ReactNode;
  requirePermission?: string;
  requireRole?: string[];
  fallback?: ReactNode;
}

export function Protected({
  children,
  requirePermission,
  requireRole,
  fallback = null,
}: ProtectedProps) {
  const { hasPermission, hasRole, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  // Check permission
  if (requirePermission && !hasPermission(requirePermission)) {
    return <>{fallback}</>;
  }

  // Check role
  if (requireRole && !hasRole(requireRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage example:
// <Protected requirePermission="can_delete_pages">
//   <DeleteButton />
// </Protected>
//
// <Protected requireRole={['super_admin', 'admin']}>
//   <UserManagement />
// </Protected>
```

## Server-Side Permission Checks

### `/lib/cms/utils/auth.ts`

```typescript
import { getSession } from '@auth0/nextjs-auth0';
import { permissionService } from '../services/permission.service';

/**
 * Get current user session
 * Use in Server Components and Server Actions
 */
export async function getUserSession() {
  try {
    const session = await getSession();
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

/**
 * Check if user has admin permissions
 */
export async function checkAdminPermissions(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      const session = await getUserSession();
      if (!session?.user) return false;
      userId = session.user.sub;
    }

    const permissions = await permissionService.getUserPermissions(userId);
    if (!permissions) return false;

    return ['super_admin', 'admin', 'editor'].includes(permissions.role);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Require authentication (use in Server Actions)
 */
export async function requireAuth() {
  const session = await getUserSession();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require specific permission (use in Server Actions)
 */
export async function requirePermission(permission: string) {
  const session = await requireAuth();
  const hasPermission = await permissionService.hasPermission(
    session.user.sub,
    permission as any
  );

  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }

  return session;
}

/**
 * Require specific role (use in Server Actions)
 */
export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  const hasRole = await permissionService.hasRole(session.user.sub, roles);

  if (!hasRole) {
    throw new Error('Insufficient role');
  }

  return session;
}
```

## Usage in Server Actions

```typescript
// /lib/cms/actions/page.actions.ts
'use server';

import { requirePermission, requireAuth } from '../utils/auth';
import { revalidatePath } from 'next/cache';
import { pageService } from '../services/page.service';

export async function createPageAction(formData: PageFormData) {
  try {
    // Check permission
    const session = await requirePermission('can_create_pages');

    // Check rate limit
    const canCreate = await permissionService.checkRateLimit(session.user.sub);
    if (!canCreate) {
      return {
        success: false,
        error: 'Daily page creation limit reached',
      };
    }

    // Create page
    const result = await pageService.createPage(formData, session.user.sub);

    if (result.success) {
      revalidatePath('/admin/pages');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unauthorized',
    };
  }
}

export async function deletePageAction(id: string) {
  try {
    // Require delete permission
    await requirePermission('can_delete_pages');

    const result = await pageService.deletePage(id);

    if (result.success) {
      revalidatePath('/admin/pages');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unauthorized',
    };
  }
}

export async function publishPageAction(id: string) {
  try {
    // Require publish permission
    const session = await requirePermission('can_publish_pages');

    const result = await pageService.publishPage(id, session.user.sub);

    if (result.success) {
      revalidatePath('/admin/pages');
      revalidatePath(`/${result.data?.slug}`);
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unauthorized',
    };
  }
}
```

## Row Level Security (RLS) Policies

Already defined in the database schema (`003_cms_tables.sql`), but here's how they work:

```sql
-- Example: Only allow admins to modify pages
CREATE POLICY "Admins have full access to pages"
  ON pages FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_permissions
      WHERE role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Example: Public can only view published pages
CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  USING (status = 'published');
```

## Admin User Management UI

```typescript
// /app/admin/settings/users/page.tsx
import { permissionService } from '@/lib/cms/services/permission.service';
import { requireRole } from '@/lib/cms/utils/auth';
import { UserTable } from './components/user-table';

export default async function UsersPage() {
  // Require super_admin role
  await requireRole(['super_admin']);

  // This will only execute if user is super_admin
  const users = await getAllUsers();

  return (
    <div>
      <h1>User Management</h1>
      <UserTable users={users} />
    </div>
  );
}
```

## Security Best Practices

1. **Never trust client-side checks**: Always validate on server
2. **Use RLS policies**: Database-level security
3. **Implement rate limiting**: Prevent abuse
4. **Audit logs**: Track all admin actions
5. **Session timeout**: Auto-logout after inactivity
6. **2FA support**: Optional two-factor authentication
7. **IP whitelisting**: Restrict admin access by IP (optional)

## Audit Logging

```typescript
// /lib/cms/services/audit.service.ts
export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  details?: any
) {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    details,
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
  });
}

// Usage in Server Actions:
await logAdminAction(session.user.sub, 'CREATE_PAGE', pageId, {
  title: page.title,
  slug: page.slug,
});
```
