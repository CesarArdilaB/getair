# CMS & Admin Panel Documentation

This document describes the CMS (Content Management System) and Admin Panel architecture for the Ignite monorepo.

## Overview

The CMS provides content management capabilities for web and mobile applications, including:

- Role-based access control (RBAC)
- Admin panel with protected routes
- Content management (pages, articles) - *coming soon*
- Media library - *coming soon*
- E-commerce (products, orders, cart) - *coming soon*

## Architecture

### Admin Panel Location

The admin panel is integrated into the web app (`apps/web/`) at the `/admin` route path, rather than being a separate application. This approach:

- Reuses existing authentication infrastructure
- Shares UI components with the main app
- Simplifies deployment (single web build)
- Enables seamless navigation between admin and public areas

### Key Packages

| Package | Purpose |
|---------|---------|
| `@packages/admin` | Admin tRPC router for access checks |
| `@shared/database/schema/rbac.ts` | RBAC database tables |
| `@shared/api-helpers` | Admin procedures (`adminProcedure`, `createPermissionProcedure`) |

## Role-Based Access Control (RBAC)

### Database Schema

The RBAC system uses four tables:

```
roles                  # Role definitions
├── id (PK)
├── name (unique)      # 'super_admin', 'editor', etc.
├── description
└── timestamps

permissions            # Permission definitions
├── id (PK)
├── name (unique)      # 'cms.pages.create'
├── resource           # 'cms.pages'
├── action             # 'create'
└── description

role_permissions       # Many-to-many: roles <-> permissions
├── role_id (FK)
└── permission_id (FK)

user_roles             # Many-to-many: users <-> roles
├── user_id (FK)
└── role_id (FK)
```

### Default Roles

| Role | Description | Admin Access |
|------|-------------|--------------|
| `super_admin` | Full system access | Yes |
| `editor` | Content and product management | Yes |
| `content_manager` | Limited content editing | Yes |
| `customer` | Regular user account | No |

### Permission Format

Permissions follow the `resource.action` naming convention:

```
cms.pages.create
cms.pages.update
cms.pages.publish
cms.pages.delete
cms.articles.create
cms.articles.publish
products.create
products.update
orders.view
orders.update
media.upload
media.delete
```

## Using Admin Procedures

### Basic Admin Procedure

Use `adminProcedure` for routes that require any admin role:

```typescript
import { adminProcedure, router } from '@shared/api-helpers'

export const myRouter = router({
    // Requires user to have super_admin, editor, or content_manager role
    listAdminData: adminProcedure.query(async ({ ctx }) => {
        // ctx.session - authenticated user session
        // ctx.userRoles - array of user's role names
        // ctx.db - database connection

        return await ctx.db.select().from(myTable)
    }),
})
```

### Permission-Based Procedure

Use `createPermissionProcedure` for routes requiring specific permissions:

```typescript
import { createPermissionProcedure, router } from '@shared/api-helpers'

// Create a procedure that requires 'cms.pages.publish' permission
const canPublishPages = createPermissionProcedure('cms.pages.publish')

export const pagesRouter = router({
    publish: canPublishPages
        .input(z.object({ pageId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Only users with cms.pages.publish permission can access
        }),
})
```

Note: `super_admin` role bypasses all permission checks.

## Frontend Components

### AdminBarrier

Protects routes by checking:
1. User is authenticated
2. User has an admin role

```typescript
import { AdminBarrier } from '@/admin/components'

// In your route definition
export const adminRoute: RouteObject = {
    path: '/admin',
    element: (
        <AdminBarrier>
            <YourAdminComponent />
        </AdminBarrier>
    ),
}
```

Behavior:
- Shows spinner while checking auth/roles
- Redirects to `/login` if not authenticated
- Redirects to `/` with `?error=access_denied` if not admin

### AdminLayout

Provides the admin panel layout with sidebar navigation:

```typescript
import { AdminLayout } from '@/admin/components'

<AdminLayout>
    <YourContent />
</AdminLayout>
```

### Admin Hooks

```typescript
import {
    useAdminRoles,
    useHasRole,
    useIsSuperAdmin
} from '@/admin/components'

function MyComponent() {
    const roles = useAdminRoles()        // ['editor', 'content_manager']
    const isEditor = useHasRole('editor') // true/false
    const isSuperAdmin = useIsSuperAdmin() // true/false
}
```

## Admin Routes Structure

```
/admin                  # Dashboard
/admin/pages           # Page management
/admin/articles        # Article management
/admin/media           # Media library
/admin/categories      # Category management
/admin/tags            # Tag management
/admin/products        # Product catalog
/admin/orders          # Order management
/admin/users           # User management
/admin/settings        # System settings
```

## Adding New Admin Features

### 1. Create the tRPC Router

```typescript
// packages/my-feature/src/router.ts
import { adminProcedure, router } from '@shared/api-helpers'
import { schema } from '@shared/database'

export const myFeature = router({
    list: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.select().from(schema.myTable)
    }),

    create: adminProcedure
        .input(createSchema)
        .mutation(async ({ ctx, input }) => {
            // Implementation
        }),
})
```

### 2. Register in API Router

```typescript
// shared/api/src/server/root.ts
import { myFeature } from '@packages/my-feature'

export const appRouter = router({
    admin,
    posts,
    myFeature, // Add here
})
```

### 3. Create Admin Screen

```typescript
// apps/web/src/admin/screens/my-feature.tsx
import { useTRPC } from '@shared/api/client'
import { useSuspenseQuery } from '@tanstack/react-query'

export function MyFeatureScreen() {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(
        trpc.myFeature.list.queryOptions()
    )

    return (
        <div>
            {/* Your UI */}
        </div>
    )
}
```

### 4. Add Route

```typescript
// apps/web/src/routers/admin.tsx
{
    path: 'my-feature',
    element: <MyFeatureScreen />,
}
```

### 5. Add Sidebar Link

```typescript
// apps/web/src/admin/components/admin-sidebar.tsx
const menuItems = [
    // ... existing items
    {
        title: 'My Feature',
        url: '/admin/my-feature',
        icon: MyIcon,
    },
]
```

## Database Seeding

To set up default roles and assign admin access to a user:

```sql
-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
    ('role_super', 'super_admin', 'Full system access'),
    ('role_editor', 'editor', 'Content and product management'),
    ('role_content', 'content_manager', 'Limited content editing'),
    ('role_customer', 'customer', 'Regular user account');

-- Assign super_admin role to a user
INSERT INTO user_roles (user_id, role_id)
VALUES ('your-user-id', 'role_super');
```

## Future Enhancements

The following features are planned for future phases:

- **Phase 2**: CMS Core (pages, articles, versioning)
- **Phase 3**: Product Catalog (products, variants, inventory)
- **Phase 4**: Shopping Cart
- **Phase 5**: Checkout & Orders (Stripe + Wompi)
- **Phase 6**: Storefront UI
- **Phase 7**: Component-based page builder

See the implementation plan for details: `~/.claude/plans/wild-brewing-wilkinson.md`
