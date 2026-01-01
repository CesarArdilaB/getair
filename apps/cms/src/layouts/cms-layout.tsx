import { SidebarInset, SidebarProvider } from '@shared/components/ui'
import type { ReactNode } from 'react'
import { CMSSidebar } from './cms-sidebar'

export function CMSLayout(props: { children: ReactNode }) {
    return (
        <SidebarProvider className="min-h-0 size-full">
            <CMSSidebar />
            <SidebarInset>{props.children}</SidebarInset>
        </SidebarProvider>
    )
}
