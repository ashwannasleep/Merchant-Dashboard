import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/stats-cards";
import { SalesCharts } from "@/components/sales-charts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Flame, Clock } from "lucide-react";
import type { DashboardStats, Product, SalesDataPoint, ThunderingHerdEvent } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: salesData, isLoading: salesLoading } = useQuery<SalesDataPoint[]>({
    queryKey: ["/api/sales"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<ThunderingHerdEvent[]>({
    queryKey: ["/api/herd-events"],
  });

  const criticalProducts = (products || [])
    .filter((p) => p.status === "Out of Stock" || p.daysOfStockLeft <= 7)
    .sort((a, b) => a.daysOfStockLeft - b.daysOfStockLeft)
    .slice(0, 5);

  const recentEvents = (events || []).slice(0, 3);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of your Amazon merchant inventory
        </p>
      </div>

      <StatsCards stats={stats} isLoading={statsLoading} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesCharts
            salesData={salesData || []}
            products={products || []}
            isLoading={salesLoading || productsLoading}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-destructive" />
                Stock Alerts
              </h3>
              <Link href="/velocity">
                <Badge variant="secondary" className="text-[10px] cursor-pointer">
                  View All
                </Badge>
              </Link>
            </div>
            {productsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : criticalProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No critical stock alerts
              </p>
            ) : (
              <div className="space-y-2">
                {criticalProducts.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-md text-sm ${
                      p.status === "Out of Stock" ? "bg-destructive/5" : "bg-yellow-500/5"
                    }`}
                    data-testid={`alert-product-${p.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-xs">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {p.status === "Out of Stock" ? (
                        <Badge variant="destructive" className="text-[10px]">OOS</Badge>
                      ) : (
                        <span className="text-xs font-medium text-destructive">
                          {p.daysOfStockLeft}d left
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                Recent Conflicts
              </h3>
              <Link href="/conflicts">
                <Badge variant="secondary" className="text-[10px] cursor-pointer">
                  View All
                </Badge>
              </Link>
            </div>
            {eventsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No conflict events yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                    data-testid={`event-summary-${e.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">
                        {e.conflictsDetected} conflicts from {e.vendorCount} vendors
                      </p>
                      <p className="text-xs text-muted-foreground">{e.strategy}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {e.resolved ? (
                        <Badge variant="secondary" className="text-[10px] bg-green-500/15 text-green-700 dark:text-green-400">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
