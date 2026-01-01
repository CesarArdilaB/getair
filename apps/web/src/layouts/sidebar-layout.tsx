import { SidebarInset, SidebarProvider } from '@shared/components/ui'
import type { ReactNode } from 'react'
import { AppSidebar } from './sidebar'

export function SidebarLayout(props: { children: ReactNode }) {
    return (
        <SidebarProvider className="min-h-0 size-full">
            <AppSidebar />
            <SidebarInset>{props.children}</SidebarInset>
        </SidebarProvider>
    )
}
