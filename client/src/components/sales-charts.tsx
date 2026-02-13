import { useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import type { SalesDataPoint, Product } from "@shared/schema";
import { useTheme } from "./theme-provider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartsProps {
  salesData: SalesDataPoint[];
  products: Product[];
  isLoading: boolean;
}

function chartColors(theme: string) {
  const isDark = theme === "dark";
  return {
    primary: isDark ? "hsl(32, 95%, 48%)" : "hsl(32, 95%, 44%)",
    primaryAlpha: isDark ? "hsla(32, 95%, 48%, 0.15)" : "hsla(32, 95%, 44%, 0.15)",
    chart2: isDark ? "hsl(28, 88%, 68%)" : "hsl(28, 88%, 38%)",
    chart3: isDark ? "hsl(24, 82%, 72%)" : "hsl(24, 82%, 35%)",
    chart4: isDark ? "hsl(20, 76%, 75%)" : "hsl(20, 76%, 32%)",
    chart5: isDark ? "hsl(16, 70%, 78%)" : "hsl(16, 70%, 30%)",
    text: isDark ? "hsl(40, 4%, 68%)" : "hsl(40, 10%, 38%)",
    grid: isDark ? "hsla(40, 3%, 16%, 0.5)" : "hsla(40, 6%, 88%, 0.5)",
    bg: isDark ? "hsl(40, 4%, 10%)" : "hsl(40, 8%, 95%)",
    green: isDark ? "hsl(142, 70%, 50%)" : "hsl(142, 70%, 40%)",
    yellow: isDark ? "hsl(45, 93%, 60%)" : "hsl(45, 93%, 47%)",
    red: isDark ? "hsl(0, 84%, 55%)" : "hsl(0, 84%, 42%)",
    blue: isDark ? "hsl(215, 70%, 60%)" : "hsl(215, 70%, 45%)",
  };
}

export function SalesCharts({ salesData, products, isLoading }: SalesChartsProps) {
  const { theme } = useTheme();
  const colors = useMemo(() => chartColors(theme), [theme]);

  const baseOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: colors.bg,
          titleColor: colors.text,
          bodyColor: colors.text,
          borderColor: colors.grid,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: { color: colors.text, font: { size: 10 } },
        },
        y: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: { color: colors.text, font: { size: 10 } },
        },
      },
    }),
    [colors]
  );

  const revenueData = useMemo(
    () => ({
      labels: salesData.slice(-14).map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: "Revenue",
          data: salesData.slice(-14).map((d) => d.revenue),
          borderColor: colors.primary,
          backgroundColor: colors.primaryAlpha,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    }),
    [salesData, colors]
  );

  const salesBarData = useMemo(
    () => ({
      labels: salesData.slice(-7).map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: "Units Sold",
          data: salesData.slice(-7).map((d) => d.sales),
          backgroundColor: colors.primary,
          borderRadius: 4,
        },
        {
          label: "Orders",
          data: salesData.slice(-7).map((d) => d.orders),
          backgroundColor: colors.chart2,
          borderRadius: 4,
        },
      ],
    }),
    [salesData, colors]
  );

  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      catMap.set(p.category, (catMap.get(p.category) || 0) + p.last30DaySales);
    });
    const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      labels: sorted.map(([cat]) => cat.length > 15 ? cat.substring(0, 15) + "..." : cat),
      datasets: [
        {
          data: sorted.map(([, v]) => v),
          backgroundColor: [colors.primary, colors.chart2, colors.chart3, colors.chart4, colors.chart5, colors.blue],
          borderWidth: 0,
        },
      ],
    };
  }, [products, colors]);

  const statusData = useMemo(() => {
    const statusMap = { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0, "Overstock": 0 };
    products.forEach((p) => statusMap[p.status]++);
    return {
      labels: Object.keys(statusMap),
      datasets: [
        {
          data: Object.values(statusMap),
          backgroundColor: [colors.green, colors.yellow, colors.red, colors.blue],
          borderWidth: 0,
        },
      ],
    };
  }, [products, colors]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="h-[300px] bg-muted rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Tabs defaultValue="revenue" className="space-y-3">
      <TabsList data-testid="tabs-analytics">
        <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
        <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
        <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
        <TabsTrigger value="status" data-testid="tab-status">Status</TabsTrigger>
      </TabsList>
      <TabsContent value="revenue">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Revenue Trend (14 Days)</h3>
          <div className="h-[280px]">
            <Line data={revenueData} options={baseOptions} />
          </div>
        </Card>
      </TabsContent>
      <TabsContent value="sales">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Sales vs Orders (7 Days)</h3>
          <div className="h-[280px]">
            <Bar
              data={salesBarData}
              options={{
                ...baseOptions,
                plugins: {
                  ...baseOptions.plugins,
                  legend: { display: true, position: "top" as const, labels: { color: colors.text, font: { size: 11 }, boxWidth: 12 } },
                },
              }}
            />
          </div>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Top Categories by 30-Day Sales</h3>
          <div className="h-[280px] flex items-center justify-center">
            <div className="w-[260px] h-[260px]">
              <Doughnut
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right" as const,
                      labels: { color: colors.text, font: { size: 10 }, boxWidth: 10, padding: 8 },
                    },
                    tooltip: baseOptions.plugins.tooltip,
                  },
                }}
              />
            </div>
          </div>
        </Card>
      </TabsContent>
      <TabsContent value="status">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Inventory Status Distribution</h3>
          <div className="h-[280px] flex items-center justify-center">
            <div className="w-[260px] h-[260px]">
              <Doughnut
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right" as const,
                      labels: { color: colors.text, font: { size: 10 }, boxWidth: 10, padding: 8 },
                    },
                    tooltip: baseOptions.plugins.tooltip,
                  },
                }}
              />
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
