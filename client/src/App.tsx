import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import InventoryPage from "@/pages/inventory";
import AnalyticsPage from "@/pages/analytics";
import VelocityPage from "@/pages/velocity";
import ConflictsPage from "@/pages/conflicts";
import type { DashboardStats, ThunderingHerdEvent } from "@shared/schema";

function Router() {
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

function AppLayout() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: events } = useQuery<ThunderingHerdEvent[]>({
    queryKey: ["/api/herd-events"],
  });

  const conflictCount = events?.filter((e) => !e.resolved).length || 0;
  const lowStockCount = stats?.lowStockCount || 0;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar conflictCount={conflictCount} lowStockCount={lowStockCount} />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 z-50 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
