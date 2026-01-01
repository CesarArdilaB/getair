import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@shared/components/ui'
import {
    FileText,
    FolderOpen,
    Home,
    ImageIcon,
    Package,
    Settings,
    ShoppingCart,
    Tags,
    Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router'
import logo from '../assets/icon.png'

const cmsMenuItems = [
    {
        title: 'Dashboard',
        url: '/',
        icon: Home,
    },
    {
        title: 'Pages',
        url: '/pages',
        icon: FileText,
    },
    {
        title: 'Articles',
        url: '/articles',
        icon: FileText,
    },
    {
        title: 'Media',
        url: '/media',
        icon: ImageIcon,
    },
    {
        title: 'Categories',
        url: '/categories',
        icon: FolderOpen,
    },
    {
        title: 'Tags',
        url: '/tags',
        icon: Tags,
    },
]

const ecommerceMenuItems = [
    {
        title: 'Products',
        url: '/products',
        icon: Package,
    },
    {
        title: 'Orders',
        url: '/orders',
        icon: ShoppingCart,
    },
]

const settingsMenuItems = [
    {
        title: 'Users',
        url: '/users',
        icon: Users,
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
    },
]

export function CMSSidebar() {
    const location = useLocation()

    const isActive = (url: string) => {
        if (url === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(url)
    }

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/">
                                <img
                                    className="size-8 block"
                                    src={logo}
                                    alt="Ignition logo"
                                />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Ignition
                                    </span>
                                    <span className="truncate text-xs">
                                        CMS
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Content</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {cmsMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                    >
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>E-commerce</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {ecommerceMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                    >
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                    >
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
