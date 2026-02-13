import {
  BarChart3,
  Box,
  LayoutDashboard,
  AlertTriangle,
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
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-primary">
            <span className="text-sm font-bold text-primary-foreground leading-none">A</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-sidebar-foreground">MerchantIQ</h2>
            <p className="text-[11px] text-sidebar-foreground/60">Inventory Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80"}
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span className="text-[13px]">{item.title}</span>
                        {item.title === "Conflict Monitor" && conflictCount > 0 && (
                          <Badge variant="destructive" className="ml-auto text-[10px]">
                            {conflictCount}
                          </Badge>
                        )}
                        {item.title === "Velocity Predictor" && lowStockCount > 0 && (
                          <Badge variant="secondary" className="ml-auto text-[10px]">
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
      <SidebarFooter className="px-3 py-3">
        <div className="text-[11px] text-sidebar-foreground/50">
          <p>Mock AWS Lambda Backend</p>
          <p className="mt-0.5">10,000+ SKUs Managed</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
