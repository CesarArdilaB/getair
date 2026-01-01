import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '../utils'
import { user } from './auth'

/**
 * Roles table - defines available roles in the system
 * Default roles: super_admin, editor, content_manager, customer
 */
export const roles = pgTable('roles', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at')
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp('updated_at')
        .$defaultFn(() => new Date())
        .notNull(),
})

/**
 * Permissions table - defines granular permissions
 * Format: resource.action (e.g., "cms.pages.create", "products.update")
 */
export const permissions = pgTable('permissions', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text('name').notNull().unique(),
    resource: text('resource').notNull(),
    action: text('action').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at')
        .$defaultFn(() => new Date())
        .notNull(),
})

/**
 * Role-Permission junction table
 * Links roles to their allowed permissions
 */
export const rolePermissions = pgTable(
    'role_permissions',
    {
        roleId: text('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'cascade' }),
        permissionId: text('permission_id')
            .notNull()
            .references(() => permissions.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at')
            .$defaultFn(() => new Date())
            .notNull(),
    },
    (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
)

/**
 * User-Role junction table
 * Assigns roles to users
 */
export const userRoles = pgTable(
    'user_roles',
    {
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        roleId: text('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at')
            .$defaultFn(() => new Date())
            .notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
)

/**
 * Default role names - use these constants for consistency
 */
export const ROLE_NAMES = {
    SUPER_ADMIN: 'super_admin',
    EDITOR: 'editor',
    CONTENT_MANAGER: 'content_manager',
    CUSTOMER: 'customer',
} as const

/**
 * Admin roles - users with these roles can access /admin
 */
export const ADMIN_ROLES = [
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.EDITOR,
    ROLE_NAMES.CONTENT_MANAGER,
] as const

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES]
export type AdminRoleName = (typeof ADMIN_ROLES)[number]
