import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { DashboardStats } from "@shared/schema";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

function StatSkeleton() {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
    {
      label: "Inventory Value",
      value: `$${(stats.totalValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
      badge: stats.lowStockCount > 50 ? "Warning" : undefined,
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockCount.toLocaleString(),
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      badge: stats.outOfStockCount > 20 ? "Critical" : undefined,
    },
    {
      label: "Avg Days of Stock",
      value: `${stats.avgDaysOfStock}d`,
      icon: Clock,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Daily Sales Velocity",
      value: stats.salesVelocity.toLocaleString(),
      icon: TrendingUp,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      label: "Conflicts Detected",
      value: stats.totalConflicts.toLocaleString(),
      icon: Zap,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
    },
    {
      label: "Conflicts Resolved",
      value: stats.resolvedConflicts.toLocaleString(),
      icon: ShieldCheck,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="p-3 hover-elevate">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">{item.label}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-semibold tracking-tight" data-testid={`text-stat-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  {item.value}
                </p>
                {item.badge && (
                  <Badge variant="destructive" className="text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded ${item.bg} shrink-0`}>
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
