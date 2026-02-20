import { useState, useMemo, useCallback } from "react";
import { Router as WouterRouter, Route, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import InventoryPage from "@/pages/inventory";
import AnalyticsPage from "@/pages/analytics";
import VelocityPage from "@/pages/velocity";
import ConflictsPage from "@/pages/conflicts";
import type { DashboardStats, ThunderingHerdEvent } from "@shared/schema";

const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === "true";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inventory" component={InventoryPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/velocity" component={VelocityPage} />
      <Route path="/conflicts" component={ConflictsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/inventory": "Inventory",
  "/analytics": "Analytics",
  "/velocity": "Sales Velocity",
  "/conflicts": "Conflict Monitor",
};

function AppLayout() {
  const [location, setLocation] = useLocation();
  const [globalSearch, setGlobalSearch] = useState("");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: events } = useQuery<ThunderingHerdEvent[]>({
    queryKey: ["/api/herd-events"],
  });

  const conflictCount = events?.filter((e) => !e.resolved).length || 0;
  const lowStockCount = stats?.lowStockCount || 0;

  const handleGlobalSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && globalSearch.trim()) {
        setLocation(`/inventory?search=${encodeURIComponent(globalSearch.trim())}`);
      }
    },
    [globalSearch, setLocation]
  );

  const pageTitle = PAGE_TITLES[location] || "MerchantIQ";

  const style = useMemo(() => ({
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3rem",
  }), []);

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar conflictCount={conflictCount} lowStockCount={lowStockCount} />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-3 px-3 py-2 border-b sticky top-0 z-50 bg-[hsl(213,28%,19%)] text-white">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="text-white/80" />
            <span className="text-sm font-medium text-white/90 shrink-0">{pageTitle}</span>
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <Input
                type="search"
                placeholder="Search products, SKUs, ASINs..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
                className="pl-8 text-sm bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:bg-white/15"
                data-testid="input-global-search"
              />
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <AppRoutes />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  const app = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  if (STATIC_MODE) {
    return <WouterRouter hook={useHashLocation}>{app}</WouterRouter>;
  }

  return app;
}

export default App;
