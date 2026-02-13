import {
  BarChart3,
  Box,
  LayoutDashboard,
  AlertTriangle,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventory", url: "/inventory", icon: Box },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Velocity Predictor", url: "/velocity", icon: TrendingUp },
  { title: "Conflict Monitor", url: "/conflicts", icon: AlertTriangle },
];

interface AppSidebarProps {
  conflictCount?: number;
  lowStockCount?: number;
}

export function AppSidebar({ conflictCount = 0, lowStockCount = 0 }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">MerchantIQ</h2>
            <p className="text-xs text-muted-foreground">Inventory Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent" : ""}
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.title === "Conflict Monitor" && conflictCount > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            {conflictCount}
                          </Badge>
                        )}
                        {item.title === "Velocity Predictor" && lowStockCount > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {lowStockCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          <p>Mock AWS Lambda Backend</p>
          <p className="mt-1">10,000+ SKUs Managed</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
