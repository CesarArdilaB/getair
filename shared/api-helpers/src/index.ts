import {
    ADMIN_ROLES,
    permissions,
    rolePermissions,
    roles,
    userRoles,
} from '@shared/database/schema'
import { initTRPC, TRPCError } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import superjson from 'superjson'
import type { TRPCContext } from './context'

export * from './context'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<TRPCContext>().create({ transformer: superjson })

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Export reusable procedure that checks if the user is authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const session = await ctx.auth.getSession(ctx.req.headers)

    if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
        ctx: {
            session,
            ...ctx,
        },
    })
})

/**
 * Admin procedure - requires the user to have an admin role
 * (super_admin, editor, or content_manager)
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    // Get user's roles from database
    const userRoleRecords = await ctx.db
        .select({
            roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(eq(userRoles.userId, ctx.session.user.id))

    const userRoleNames = userRoleRecords.map((r) => r.roleName)
    const isAdmin = userRoleNames.some((roleName) =>
        ADMIN_ROLES.includes(roleName as (typeof ADMIN_ROLES)[number]),
    )

    if (!isAdmin) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Admin access required',
        })
    }

    return next({
        ctx: {
            ...ctx,
            userRoles: userRoleNames,
        },
    })
})

/**
 * Creates a procedure that requires a specific permission
 * @param requiredPermission - Permission in format "resource.action" (e.g., "cms.pages.create")
 */
export function createPermissionProcedure(requiredPermission: string) {
    return adminProcedure.use(async ({ ctx, next }) => {
        // For super_admin, allow all permissions
        if (ctx.userRoles.includes('super_admin')) {
            return next({ ctx })
        }

        // Check if user has the specific permission through their roles
        const hasPermission = await ctx.db
            .select({ id: userRoles.userId })
            .from(userRoles)
            .innerJoin(roles, eq(roles.id, userRoles.roleId))
            .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
            .innerJoin(
                permissions,
                eq(permissions.id, rolePermissions.permissionId),
            )
            .where(
                and(
                    eq(userRoles.userId, ctx.session.user.id),
                    eq(permissions.name, requiredPermission),
                ),
            )
            .limit(1)

        if (hasPermission.length === 0) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: `Permission '${requiredPermission}' required`,
            })
        }

        return next({ ctx })
    })
}
