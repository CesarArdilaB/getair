import { protectedProcedure, router } from '@shared/api-helpers'
import { ADMIN_ROLES, roles, userRoles } from '@shared/database/schema'
import { eq } from 'drizzle-orm'

export const cms = router({
    /**
     * Check if the current user has admin access
     * Returns the user's roles if they have admin access
     */
    checkAccess: protectedProcedure.query(async ({ ctx }) => {
        const userRoleRecords = await ctx.db
            .select({
                roleName: roles.name,
                roleId: roles.id,
            })
            .from(userRoles)
            .innerJoin(roles, eq(roles.id, userRoles.roleId))
            .where(eq(userRoles.userId, ctx.session.user.id))

        const userRoleNames = userRoleRecords.map((r) => r.roleName)
        const isAdmin = userRoleNames.some((roleName) =>
            ADMIN_ROLES.includes(roleName as (typeof ADMIN_ROLES)[number]),
        )

        return {
            isAdmin,
            roles: userRoleNames,
        }
    }),

    /**
     * Get all available roles (admin only)
     */
    listRoles: protectedProcedure.query(async ({ ctx }) => {
        const allRoles = await ctx.db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description,
            })
            .from(roles)

        return allRoles
    }),
})
