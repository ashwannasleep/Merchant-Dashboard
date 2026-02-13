import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Search,
  ArrowDown,
  ArrowUp,
  Flame,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface VelocityPredictorProps {
  products: Product[];
  isLoading: boolean;
}

type RiskLevel = "critical" | "warning" | "healthy" | "overstock";

function getRiskLevel(product: Product): RiskLevel {
  if (product.status === "Out of Stock" || product.daysOfStockLeft === 0) return "critical";
  if (product.daysOfStockLeft <= 7) return "critical";
  if (product.daysOfStockLeft <= 14) return "warning";
  if (product.status === "Overstock") return "overstock";
  return "healthy";
}

function RiskBadge({ level }: { level: RiskLevel }) {
  switch (level) {
    case "critical":
      return (
        <Badge variant="destructive" className="text-[10px] gap-1">
          <Flame className="w-3 h-3" /> Critical
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="outline" className="text-[10px] gap-1">
          <AlertTriangle className="w-3 h-3" /> Warning
        </Badge>
      );
    case "overstock":
      return (
        <Badge variant="secondary" className="text-[10px] gap-1">
          <ShieldAlert className="w-3 h-3" /> Overstock
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-[10px] gap-1">
          <CheckCircle className="w-3 h-3" /> Healthy
        </Badge>
      );
  }
}

function SparkLine({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  const trend = data[data.length - 1] - data[0];

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={trend >= 0 ? "hsl(142, 70%, 45%)" : "hsl(0, 84%, 50%)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VelocityPredictor({ products, isLoading }: VelocityPredictorProps) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"daysLeft" | "velocity" | "revenue">("daysLeft");

  const analyzed = useMemo(() => {
    let result = products.map((p) => ({
      ...p,
      risk: getRiskLevel(p),
      projectedRevenueLoss: p.status === "Out of Stock"
        ? p.avgDailySales * p.price * 7
        : p.daysOfStockLeft <= 7
        ? p.avgDailySales * p.price * (7 - p.daysOfStockLeft)
        : 0,
      reorderQty: Math.max(0, Math.ceil(p.avgDailySales * 30 - p.currentStock)),
      salesTrend: p.last7DaySales.length > 1
        ? ((p.last7DaySales[6] - p.last7DaySales[0]) / Math.max(p.last7DaySales[0], 1)) * 100
        : 0,
    }));

    if (search) {
      const lc = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(lc) || p.sku.toLowerCase().includes(lc)
      );
    }
    if (riskFilter !== "all") {
      result = result.filter((p) => p.risk === riskFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "daysLeft") return a.daysOfStockLeft - b.daysOfStockLeft;
      if (sortBy === "velocity") return b.avgDailySales - a.avgDailySales;
      return b.projectedRevenueLoss - a.projectedRevenueLoss;
    });

    return result;
  }, [products, search, riskFilter, sortBy]);

  const summary = useMemo(() => {
    const critical = products.filter((p) => getRiskLevel(p) === "critical").length;
    const warning = products.filter((p) => getRiskLevel(p) === "warning").length;
    const healthy = products.filter((p) => getRiskLevel(p) === "healthy").length;
    const totalRevenueLoss = products
      .filter((p) => p.status === "Out of Stock")
      .reduce((s, p) => s + p.avgDailySales * p.price * 7, 0);
    return { critical, warning, healthy, totalRevenueLoss };
  }, [products]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-16 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-2 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[11px] text-muted-foreground">Critical Risk</span>
          </div>
          <p className="text-xl font-bold text-destructive" data-testid="text-critical-count">{summary.critical}</p>
        </Card>
        <Card className="p-3 bg-chart-5/5">
          <div className="flex items-center gap-2 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-chart-5" />
            <span className="text-[11px] text-muted-foreground">Warning</span>
          </div>
          <p className="text-xl font-bold text-chart-5" data-testid="text-warning-count">{summary.warning}</p>
        </Card>
        <Card className="p-3 bg-chart-1/5">
          <div className="flex items-center gap-2 mb-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-chart-1" />
            <span className="text-[11px] text-muted-foreground">Healthy</span>
          </div>
          <p className="text-xl font-bold text-chart-1" data-testid="text-healthy-count">{summary.healthy}</p>
        </Card>
        <Card className="p-3 bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[11px] text-muted-foreground">Weekly Revenue Risk</span>
          </div>
          <p className="text-xl font-bold text-destructive" data-testid="text-revenue-risk">
            ${(summary.totalRevenueLoss / 1000).toFixed(1)}K
          </p>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-velocity"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[130px]" data-testid="select-risk-filter">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="overstock">Overstock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]" data-testid="select-sort-velocity">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daysLeft">Days Left</SelectItem>
            <SelectItem value="velocity">Velocity</SelectItem>
            <SelectItem value="revenue">Revenue Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {analyzed.length.toLocaleString()} products
      </p>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {analyzed.slice(0, 100).map((p) => (
          <Card
            key={p.id}
            className={`p-3 ${
              p.risk === "critical" ? "bg-destructive/5 border-destructive/20" : ""
            }`}
            data-testid={`card-velocity-${p.id}`}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{p.title}</span>
                  <span className="text-xs text-muted-foreground font-mono">{p.sku}</span>
                  <RiskBadge level={p.risk} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>{p.category}</span>
                  <span>${p.price.toFixed(2)}</span>
                  <span>{p.fulfillment}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Stock</p>
                  <p className="text-sm font-semibold tabular-nums">{p.currentStock}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Days Left</p>
                  <p className={`text-sm font-semibold tabular-nums ${
                    p.daysOfStockLeft === 0 ? "text-destructive" :
                    p.daysOfStockLeft <= 7 ? "text-destructive" :
                    p.daysOfStockLeft <= 14 ? "text-yellow-600 dark:text-yellow-400" : ""
                  }`}>
                    {p.daysOfStockLeft === 0 ? "OOS" : `${p.daysOfStockLeft}d`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Velocity</p>
                  <p className="text-sm tabular-nums">{p.avgDailySales}/day</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">7-Day Trend</p>
                  <SparkLine data={p.last7DaySales} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Trend</p>
                  <div className="flex items-center gap-1">
                    {p.salesTrend >= 0 ? (
                      <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${p.salesTrend >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                      {Math.abs(p.salesTrend).toFixed(0)}%
                    </span>
                  </div>
                </div>
                {p.projectedRevenueLoss > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Rev. Risk</p>
                    <p className="text-sm font-semibold text-destructive tabular-nums">
                      -${p.projectedRevenueLoss.toFixed(0)}
                    </p>
                  </div>
                )}
                {p.reorderQty > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Reorder</p>
                    <p className="text-sm font-medium tabular-nums text-primary">{p.reorderQty}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
