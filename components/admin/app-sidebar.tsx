"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Store,
  LayoutList,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Categories", url: "/admin/categories", icon: LayoutList },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-6 flex items-center justify-center">
        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center w-full px-2 group-data-[collapsible=icon]:px-0"
        >
          <div className="group-data-[collapsible=icon]:hidden flex items-center justify-center">
            <Image
              src="/amazon-logo-white.png"
              alt="Amazon Admin"
              width={100}
              height={30}
              className="object-contain"
            />
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
            <Image
              src="/amazon-logo-icon.jpeg"
              alt="Amazon Admin"
              width={100}
              height={30}
              className="object-contain rounded-lg"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-4">
        <SidebarMenuButton asChild size="sm" className="justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-4 w-4 group-data-[collapsible=icon]:ml-3" />
            <span className="group-data-[collapsible=icon]:hidden">
              Main Store
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
