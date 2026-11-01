import { Link, usePage } from '@inertiajs/react';
import { Flower2, Heart, Home, LayoutGrid, Package, Settings, ShoppingBag } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const mainNavItems: NavItem[] = isAdmin
        ? [
              {
                  title: 'Admin Dashboard',
                  href: '/admin/products',
                  icon: LayoutGrid,
              },
              {
                  title: 'Products Manager',
                  href: '/admin/products',
                  icon: Flower2,
              },
              {
                  title: 'Orders Manager',
                  href: '/admin/orders',
                  icon: Package,
              },
              {
                  title: 'Users Manager',
                  href: '/admin/users',
                  icon: Settings,
              },
          ]
        : [
              {
                  title: 'User Dashboard',
                  href: '/dashboard/user',
                  icon: LayoutGrid,
              },
              {
                  title: 'Shop Flowers',
                  href: '/products',
                  icon: Flower2,
              },
              {
                  title: 'My Orders',
                  href: '/orders',
                  icon: Package,
              },
              {
                  title: 'My Wishlist',
                  href: '/wishlist',
                  icon: Heart,
              },
              {
                  title: 'Shopping Cart',
                  href: '/cart',
                  icon: ShoppingBag,
              },
          ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Store Homepage',
            href: '/',
            icon: Home,
        },
        {
            title: 'Account Settings',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? '/admin/products' : '/dashboard/user'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
