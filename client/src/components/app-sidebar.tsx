import { LayoutDashboard, ShoppingCart, Package, FileText, Truck, ClipboardList, Users, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    pageKey: "dashboard",
  },
  {
    title: "User Management",
    icon: Users,
    href: "/users",
    pageKey: "user-management",
  },
  {
    title: "Add Items",
    icon: Package,
    href: "/items",
    pageKey: "add-items",
  },
  {
    title: "Items List",
    icon: FileText,
    href: "/item-details",
    pageKey: "items-list",
  },
  {
    title: "Add Purchase Orders",
    icon: ShoppingCart,
    href: "/purchase-orders",
    pageKey: "add-purchase-orders",
  },
  {
    title: "Order Processing",
    icon: Truck,
    href: "/process-orders",
    pageKey: "order-processing",
  },
  {
    title: "Detailed Order Status",
    icon: ClipboardList,
    href: "/detailed-order-status",
    pageKey: "detailed-order-status",
  },
  {
    title: "User Log Details",
    icon: History,
    href: "/user-log-details",
    pageKey: "user-log-details",
  },
];

interface PermissionsResponse {
  allowedPages: string[];
}

export function AppSidebar() {
  const [location] = useLocation();
  
  const { data: permissions } = useQuery<PermissionsResponse>({
    queryKey: ["/api/auth/permissions"],
  });

  const allowedPages = permissions?.allowedPages || [];
  const hasNoRestrictions = allowedPages.length === 0;

  const visibleItems = items.filter((item) => {
    if (hasNoRestrictions) return true;
    return allowedPages.includes(item.pageKey);
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.href}
                    className={location === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
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
  );
}
