import { createBrowserRouter, Outlet } from 'react-router'
import { CMSBarrier } from '@/components/cms-barrier'
import { CMSLayout } from '@/layouts/cms-layout'
import { DashboardScreen } from '@/screens/dashboard'
import { authRoute } from './auth'

/**
 * Placeholder screen for routes not yet implemented
 */
function PlaceholderScreen(props: { title: string }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{props.title}</h1>
            <p className="text-muted-foreground mt-2">
                This section is coming soon.
            </p>
        </div>
    )
}

/**
 * CMS main routes - protected by CMSBarrier
 */
const cmsRoute = {
    element: (
        <CMSBarrier>
            <CMSLayout>
                <Outlet />
            </CMSLayout>
        </CMSBarrier>
    ),
    children: [
        {
            index: true,
            element: <DashboardScreen />,
        },
        // CMS Content routes
        {
            path: 'pages',
            element: <PlaceholderScreen title="Pages" />,
        },
        {
            path: 'articles',
            element: <PlaceholderScreen title="Articles" />,
        },
        {
            path: 'media',
            element: <PlaceholderScreen title="Media Library" />,
        },
        {
            path: 'categories',
            element: <PlaceholderScreen title="Categories" />,
        },
        {
            path: 'tags',
            element: <PlaceholderScreen title="Tags" />,
        },
        // E-commerce routes
        {
            path: 'products',
            element: <PlaceholderScreen title="Products" />,
        },
        {
            path: 'orders',
            element: <PlaceholderScreen title="Orders" />,
        },
        // Settings routes
        {
            path: 'users',
            element: <PlaceholderScreen title="User Management" />,
        },
        {
            path: 'settings',
            element: <PlaceholderScreen title="Settings" />,
        },
    ],
}

/**
 * Entrypoint for react-router routes.
 */
export const router = createBrowserRouter([
    // Auth routes (login, sign up)
    authRoute,
    // CMS routes (protected)
    cmsRoute,
])
