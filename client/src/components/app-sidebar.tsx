import { LayoutDashboard, ShoppingCart, Package, FileText, Truck, ClipboardList, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
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
  },
  {
    title: "User Management",
    icon: Users,
    href: "/users",
  },
  {
    title: "Add Items",
    icon: Package,
    href: "/items",
  },
  {
    title: "Items List",
    icon: FileText,
    href: "/item-details",
  },
  {
    title: "Add Purchase Orders",
    icon: ShoppingCart,
    href: "/purchase-orders",
  },
  {
    title: "Order Processing",
    icon: Truck,
    href: "/process-orders",
  },
  {
    title: "Detailed Order Status",
    icon: ClipboardList,
    href: "/detailed-order-status",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
