import { useQuery } from "@tanstack/react-query";
import { SalesCharts } from "@/components/sales-charts";
import { Card } from "@/components/ui/card";
import type { SalesDataPoint, Product } from "@shared/schema";
import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/components/theme-provider";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { data: salesData, isLoading: salesLoading } = useQuery<SalesDataPoint[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const kpiData = useMemo(() => {
    if (!salesData || !products) return null;
    const last7 = salesData.slice(-7);
    const prev7 = salesData.slice(-14, -7);
    const last7Rev = last7.reduce((s, d) => s + d.revenue, 0);
    const prev7Rev = prev7.reduce((s, d) => s + d.revenue, 0);
    const revChange = prev7Rev > 0 ? ((last7Rev - prev7Rev) / prev7Rev) * 100 : 0;
    const last7Sales = last7.reduce((s, d) => s + d.sales, 0);
    const avgOrderValue = last7.reduce((s, d) => s + d.revenue, 0) / Math.max(last7.reduce((s, d) => s + d.orders, 0), 1);
    const margin = products.reduce((s, p) => s + (p.price - p.cost) * p.avgDailySales, 0);
    return {
      last7Rev,
      revChange,
      last7Sales,
      avgOrderValue,
      dailyMargin: margin,
    };
  }, [salesData, products]);

  const isDark = theme === "dark";
  const textColor = isDark ? "hsl(40, 4%, 68%)" : "hsl(40, 10%, 38%)";
  const gridColor = isDark ? "hsla(40, 3%, 16%, 0.5)" : "hsla(40, 6%, 88%, 0.5)";

  const fullRevenueChart = useMemo(() => {
    if (!salesData) return null;
    return {
      labels: salesData.map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: "Revenue",
          data: salesData.map((d) => d.revenue),
          borderColor: isDark ? "hsl(32, 95%, 48%)" : "hsl(32, 95%, 44%)",
          backgroundColor: isDark ? "hsla(32, 95%, 48%, 0.1)" : "hsla(32, 95%, 44%, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 1,
          pointHoverRadius: 4,
        },
        {
          label: "Orders",
          data: salesData.map((d) => d.orders * 30),
          borderColor: isDark ? "hsl(28, 88%, 68%)" : "hsl(28, 88%, 38%)",
          backgroundColor: "transparent",
          tension: 0.4,
          pointRadius: 0,
          borderDash: [4, 4],
        },
      ],
    };
  }, [salesData, isDark]);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sales performance and inventory analytics powered by Chart.js
        </p>
      </div>

      {kpiData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">7-Day Revenue</p>
            <p className="text-xl font-bold mt-1" data-testid="text-7day-revenue">
              ${(kpiData.last7Rev / 1000).toFixed(1)}K
            </p>
            <p className={`text-xs mt-1 ${kpiData.revChange >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              {kpiData.revChange >= 0 ? "+" : ""}{kpiData.revChange.toFixed(1)}% vs prev
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">7-Day Units Sold</p>
            <p className="text-xl font-bold mt-1" data-testid="text-7day-sales">{kpiData.last7Sales.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="text-xl font-bold mt-1" data-testid="text-aov">${kpiData.avgOrderValue.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Est. Daily Margin</p>
            <p className="text-xl font-bold mt-1" data-testid="text-daily-margin">${(kpiData.dailyMargin / 1000).toFixed(1)}K</p>
          </Card>
        </div>
      )}

      {fullRevenueChart && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Revenue & Orders (30 Days)</h3>
          <div className="h-[350px]">
            <Line
              data={fullRevenueChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index" as const, intersect: false },
                plugins: {
                  legend: {
                    display: true,
                    position: "top" as const,
                    labels: { color: textColor, font: { size: 11 }, boxWidth: 12 },
                  },
                  tooltip: {
                    backgroundColor: isDark ? "hsl(40, 4%, 10%)" : "hsl(40, 8%, 95%)",
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 6,
                  },
                },
                scales: {
                  x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { size: 10 }, maxRotation: 0 },
                    border: { display: false },
                  },
                  y: {
                    grid: { color: gridColor },
                    border: { display: false },
                    ticks: { color: textColor, font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
        </Card>
      )}

      <SalesCharts
        salesData={salesData || []}
        products={products || []}
        isLoading={salesLoading || productsLoading}
      />
    </div>
  );
}
