import { useQuery } from "@tanstack/react-query";
import type { DashboardStats, ThunderingHerdEvent } from "@shared/schema";
import { Link, useLocation } from "wouter";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Inventory", icon: "package_2", href: "/inventory" },
  { label: "Analytics", icon: "analytics", href: "/analytics" },
  { label: "Velocity", icon: "trending_up", href: "/velocity" },
  { label: "Conflicts", icon: "gpp_maybe", href: "/conflicts" },
];

const keyMetrics = [
  {
    icon: "inventory",
    iconClassName: "bg-[#4051b5]/10 text-[#4051b5]",
    badge: "+12%",
    badgeClassName: "text-emerald-600 bg-emerald-50",
    label: "Total Products",
    value: "10,000",
    valueClassName: "",
  },
  {
    icon: "payments",
    iconClassName: "bg-[#4051b5]/10 text-[#4051b5]",
    badge: "+5.2%",
    badgeClassName: "text-emerald-600 bg-emerald-50",
    label: "Inventory Value",
    value: "$263,451K",
    valueClassName: "",
  },
  {
    icon: "priority_high",
    iconClassName: "bg-orange-100 text-orange-600",
    badge: "Warning",
    badgeClassName: "text-white bg-orange-500 uppercase text-[10px] font-bold",
    label: "Low Stock",
    value: "1,373",
    valueClassName: "text-orange-600",
  },
  {
    icon: "block",
    iconClassName: "bg-red-100 text-red-600",
    badge: "Stable",
    badgeClassName: "text-slate-400 bg-transparent",
    label: "Out of Stock",
    value: "20",
    valueClassName: "text-red-600",
  },
];

const secondaryMetrics = [
  { icon: "schedule", label: "Avg Days of Stock", value: "33.8d" },
  { icon: "bolt", label: "Daily Sales Velocity", value: "155,031" },
  { icon: "warning", label: "Conflicts Detected", value: "104" },
  { icon: "check_circle", label: "Conflicts Resolved", value: "104" },
];

const skuRows = [
  {
    name: "Wireless Noise Cancelling Headphones",
    sku: "AUD-99-BL",
    velocity: "45/day",
    status: "IN STOCK",
    statusClassName: "bg-emerald-50 text-emerald-600",
    revenue: "$12,450",
  },
  {
    name: "Ergonomic Mesh Office Chair",
    sku: "OFF-CH-01",
    velocity: "12/day",
    status: "IN STOCK",
    statusClassName: "bg-emerald-50 text-emerald-600",
    revenue: "$8,920",
  },
  {
    name: "Smart Fitness Tracker Pro",
    sku: "WT-SM-44",
    velocity: "88/day",
    status: "LOW STOCK",
    statusClassName: "bg-orange-50 text-orange-600",
    revenue: "$15,200",
  },
];

const stockAlerts = [
  {
    name: "Premium Dog Bed (Large)",
    sku: "PET-BED-LRG",
    badge: "0d left",
    badgeClassName: "text-red-600 bg-red-50",
    borderClassName: "border-red-500",
  },
  {
    name: "Max Heavy Duty Stapler",
    sku: "OFF-STP-MAX",
    badge: "OOS",
    badgeClassName: "text-slate-500 bg-slate-100",
    borderClassName: "border-slate-400",
  },
  {
    name: 'Copper Saut\u00e9 Pan 12"',
    sku: "KTC-PAN-CP",
    badge: "3d left",
    badgeClassName: "text-orange-600 bg-orange-50",
    borderClassName: "border-orange-400",
  },
];

const recentConflicts = [
  {
    title: "Inventory Sync Error",
    description: "Mismatch between Amazon CA and SellerCentral Global (24 units).",
    time: "2 mins ago",
    active: true,
  },
  {
    title: "Duplicate SKU Warning",
    description: 'Identified two listings for "Kettle 1.5L" with conflicting weights.',
    time: "1 hour ago",
    active: false,
  },
  {
    title: "ASIN Change Detected",
    description: 'Amazon modified product category for "Yoga Mat V2".',
    time: "3 hours ago",
    active: false,
  },
];

export default function Dashboard() {
  const [location] = useLocation();
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });
  const { data: events } = useQuery<ThunderingHerdEvent[]>({
    queryKey: ["/api/herd-events"],
  });

  const totalConflicts = stats?.totalConflicts ?? 0;
  const resolvedConflicts = stats?.resolvedConflicts ?? 0;
  const unresolvedConflicts = Math.max(totalConflicts - resolvedConflicts, 0);
  const totalProducts = stats?.totalProducts ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const outOfStockCount = stats?.outOfStockCount ?? 0;
  const lowStockRatio = totalProducts > 0 ? lowStockCount / totalProducts : 0;
  const outOfStockRatio = totalProducts > 0 ? outOfStockCount / totalProducts : 0;
  const latestVendorBurst = events?.[0]?.vendorCount ?? 0;

  const systemStatus = !stats
    ? "Monitoring"
    : unresolvedConflicts > 0 || outOfStockRatio >= 0.01
      ? "Degraded"
      : lowStockRatio >= 0.18
        ? "Monitoring"
        : "Operational";

  const systemStatusDotClass =
    systemStatus === "Operational"
      ? "bg-emerald-400"
      : systemStatus === "Monitoring"
        ? "bg-amber-300"
        : "bg-red-400";

  const systemStatusMessage = !stats
    ? "Loading live inventory and conflict telemetry."
    : systemStatus === "Degraded"
      ? unresolvedConflicts > 0
        ? `${unresolvedConflicts.toLocaleString()} unresolved conflict events need manual review.`
        : `${outOfStockCount.toLocaleString()} SKUs are out of stock and above the safety threshold.`
      : systemStatus === "Monitoring"
        ? `${lowStockCount.toLocaleString()} low-stock SKUs are being monitored with no unresolved conflicts.`
        : latestVendorBurst > 0
          ? `Latest sync burst handled ${latestVendorBurst} concurrent vendor updates with full conflict resolution.`
          : `No unresolved conflict events detected. Inventory sync pipelines are healthy.`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f6f8] dark:bg-[#14161e] font-sans text-slate-900 dark:text-slate-100 antialiased">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#14161e] lg:flex">
        <div className="flex items-center gap-3 p-6">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#4051b5]/10 text-[#4051b5]">
            <span className="material-symbols-outlined text-lg">inventory_2</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-200">MerchantIQ</h1>
            <p className="text-[10px] font-medium text-slate-400">Inventory Hub</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2 transition-all ${
                  active
                    ? "bg-slate-100 font-semibold text-[#4051b5] dark:bg-slate-800"
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Plan Usage</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full w-3/4 rounded-full bg-[#4051b5]" />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">7,500 of 10,000 SKUs used</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-[#14161e]">
          <div className="max-w-xl flex-1">
            <div className="group relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#4051b5]">
                search
              </span>
              <input
                type="text"
                placeholder="Search products, SKUs, or shipments..."
                className="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#4051b5]/20 dark:bg-slate-900"
              />
            </div>
          </div>
          <div className="ml-4 flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-[#14161e]" />
            </button>
            <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f6f6f8] p-6 dark:bg-[#14161e] lg:p-8">
          <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6">
            {keyMetrics.map((metric) => (
              <div
                key={metric.label}
                className="col-span-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-6 xl:col-span-3"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${metric.iconClassName}`}>
                    <span className="material-symbols-outlined">{metric.icon}</span>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${metric.badgeClassName}`}>
                    {metric.badge}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className={`mt-1 text-2xl font-bold ${metric.valueClassName}`}>{metric.value}</p>
              </div>
            ))}

            <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {secondaryMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-xl">{metric.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                    <p className="text-lg font-bold">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-span-12 space-y-6 xl:col-span-9">
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-lg font-bold">Revenue Trend (14 Days)</h3>
                    <p className="text-xs text-slate-500">Visualization of global merchant revenue</p>
                  </div>
                  <div className="flex self-start rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                    <button className="rounded-md bg-white px-4 py-1.5 text-xs font-bold text-[#4051b5] shadow-sm dark:bg-slate-900">
                      Revenue
                    </button>
                    <button className="rounded-md px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      Sales
                    </button>
                    <button className="rounded-md px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      Categories
                    </button>
                    <button className="rounded-md px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      Status
                    </button>
                  </div>
                </div>
                <div className="relative h-[400px] p-6">
                  <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4051b5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4051b5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,300 C50,250 100,280 150,180 C200,80 250,120 300,100 C350,80 400,150 450,140 C500,130 550,60 600,80 C650,100 700,40 750,20 C800,0 800,300 800,300 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,300 C50,250 100,280 150,180 C200,80 250,120 300,100 C350,80 400,150 450,140 C500,130 550,60 600,80 C650,100 700,40 750,20"
                      fill="none"
                      stroke="#4051b5"
                      strokeWidth="3"
                    />
                    <circle cx="150" cy="180" r="4" fill="white" stroke="#4051b5" strokeWidth="2" />
                    <circle cx="300" cy="100" r="4" fill="white" stroke="#4051b5" strokeWidth="2" />
                    <circle cx="450" cy="140" r="4" fill="white" stroke="#4051b5" strokeWidth="2" />
                    <circle cx="600" cy="80" r="4" fill="white" stroke="#4051b5" strokeWidth="2" />
                    <circle cx="750" cy="20" r="4" fill="white" stroke="#4051b5" strokeWidth="2" />
                  </svg>

                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 opacity-20">
                    <div className="w-full border-t border-slate-300" />
                    <div className="w-full border-t border-slate-300" />
                    <div className="w-full border-t border-slate-300" />
                    <div className="w-full border-t border-slate-300" />
                    <div className="w-full border-t border-slate-300" />
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                  <h3 className="text-lg font-bold">Top Performing SKUs</h3>
                  <button className="text-sm font-bold text-[#4051b5] hover:underline">View All</button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4 text-center">SKU</th>
                      <th className="px-6 py-4 text-center">Velocity</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                    {skuRows.map((row) => (
                      <tr key={row.sku}>
                        <td className="px-6 py-4 font-medium">{row.name}</td>
                        <td className="px-6 py-4 text-center text-slate-500">{row.sku}</td>
                        <td className="px-6 py-4 text-center">{row.velocity}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`rounded px-2 py-1 text-[10px] font-bold ${row.statusClassName}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">{row.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 space-y-6 xl:col-span-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-orange-500">notification_important</span>
                    Stock Alerts
                  </h3>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">12 New</span>
                </div>
                <div className="space-y-4">
                  {stockAlerts.map((alert) => (
                    <div
                      key={alert.sku}
                      className={`rounded-xl border-l-4 bg-slate-50 p-3 dark:bg-slate-800 ${alert.borderClassName}`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="truncate pr-2 text-sm font-bold">{alert.name}</p>
                        <span className={`rounded px-1 text-[10px] font-bold ${alert.badgeClassName}`}>
                          {alert.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">SKU: {alert.sku}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800">
                  Review All Alerts
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-6 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[#4051b5]">shuffle</span>
                  Recent Conflicts
                </h3>
                <div className="relative space-y-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {recentConflicts.map((conflict) => (
                    <div key={conflict.title} className="relative pl-8">
                      <div
                        className={`absolute left-0 top-1 z-10 h-5 w-5 rounded-full border-2 bg-white dark:bg-slate-900 ${
                          conflict.active ? "border-[#4051b5]" : "border-slate-300"
                        }`}
                      />
                      <p className="text-xs font-bold">{conflict.title}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{conflict.description}</p>
                      <span className="mt-2 inline-block text-[9px] font-bold uppercase text-slate-400">{conflict.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#4051b5] p-6 text-white">
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 rotate-12 text-9xl opacity-10">
                  check_circle
                </span>
                <h4 className="mb-2 font-bold">System Status</h4>
                <p className="mb-4 text-xs leading-relaxed opacity-90">
                  {systemStatusMessage}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 animate-pulse rounded-full ${systemStatusDotClass}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{systemStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
