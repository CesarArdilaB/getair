import { useTRPC } from '@shared/api/client'
import { Center, Spinner } from '@shared/components/custom'
import { useQuery } from '@tanstack/react-query'
import { Navigate, useLocation } from 'react-router'
import { useSession } from '@/auth/hooks'

/**
 * CMSBarrier - Protects CMS routes by checking:
 * 1. User is authenticated
 * 2. User has a CMS admin role (super_admin, editor, or content_manager)
 *
 * If not authenticated, redirects to login.
 * If authenticated but not admin, shows access denied.
 */
export function CMSBarrier(props: { children?: React.ReactNode }) {
    const session = useSession()
    const location = useLocation()
    const trpc = useTRPC()

    // Check CMS access via tRPC
    const cmsCheck = useQuery({
        ...trpc.cms.checkAccess.queryOptions(),
        enabled: session !== null && session !== undefined,
    })

    // Still loading session
    if (session === undefined) {
        return (
            <Center>
                <Spinner />
            </Center>
        )
    }

    // Not authenticated - redirect to login
    if (session === null) {
        return (
            <Navigate
                to={{
                    pathname: '/login',
                    search: `?redirect=${encodeURIComponent(location.pathname)}`,
                }}
            />
        )
    }

    // Loading CMS check
    if (cmsCheck.isPending) {
        return (
            <Center>
                <Spinner />
            </Center>
        )
    }

    // CMS check failed or user is not admin
    if (cmsCheck.isError || !cmsCheck.data?.isAdmin) {
        return (
            <Center>
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">
                        You don't have permission to access the CMS.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Contact your administrator to request access.
                    </p>
                </div>
            </Center>
        )
    }

    return <>{props.children}</>
}

/**
 * Hook to get current user's CMS roles
 * Must be used inside CMSBarrier
 */
export function useCMSRoles(): string[] {
    const trpc = useTRPC()
    const cmsCheck = useQuery(trpc.cms.checkAccess.queryOptions())

    if (!cmsCheck.data?.isAdmin) {
        throw new Error(
            'useCMSRoles must be used inside CMSBarrier with a valid CMS user',
        )
    }

    return cmsCheck.data.roles
}

/**
 * Hook to check if current user has a specific role
 */
export function useHasRole(roleName: string): boolean {
    const roles = useCMSRoles()
    return roles.includes(roleName)
}

/**
 * Hook to check if current user is a super admin
 */
export function useIsSuperAdmin(): boolean {
    return useHasRole('super_admin')
}
