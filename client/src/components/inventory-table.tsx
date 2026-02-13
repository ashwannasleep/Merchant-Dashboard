import { useCallback, useMemo, useState } from "react";
import { List } from "react-window";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Star,
} from "lucide-react";
import type { Product } from "@shared/schema";
import { productCategories, fulfillmentTypes, stockStatuses } from "@shared/schema";

interface InventoryTableProps {
  products: Product[];
  isLoading: boolean;
  containerHeight?: number;
}

type SortField = "title" | "price" | "currentStock" | "daysOfStockLeft" | "avgDailySales" | "last30DaySales" | "rating";
type SortDirection = "asc" | "desc";

function getStatusBadge(status: Product["status"]) {
  switch (status) {
    case "In Stock":
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    case "Low Stock":
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    case "Out of Stock":
      return <Badge variant="destructive" className="text-[10px]">{status}</Badge>;
    case "Overstock":
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  }
}

function getDaysOfStockColor(days: number): string {
  if (days === 0) return "text-destructive font-semibold";
  if (days <= 7) return "text-destructive";
  if (days <= 14) return "text-yellow-600 dark:text-yellow-400";
  return "text-foreground";
}

function StockBar({ current, max, reorder }: { current: number; max: number; reorder: number }) {
  const pct = Math.min((current / max) * 100, 100);
  const reorderPct = (reorder / max) * 100;
  let barColor = "bg-green-500";
  if (current === 0) barColor = "bg-destructive";
  else if (current <= reorder) barColor = "bg-yellow-500";
  else if (pct > 90) barColor = "bg-blue-500";

  return (
    <div className="w-20 h-2 bg-muted rounded-full relative overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-0 h-full w-px bg-foreground/30"
        style={{ left: `${reorderPct}%` }}
      />
    </div>
  );
}

const COLUMN_WIDTHS = {
  sku: "w-[90px]",
  title: "flex-1 min-w-[180px]",
  category: "w-[130px]",
  price: "w-[80px]",
  stock: "w-[140px]",
  status: "w-[100px]",
  days: "w-[80px]",
  velocity: "w-[80px]",
  fulfillment: "w-[60px]",
  rating: "w-[80px]",
};

function TableHeader({
  sortField,
  sortDirection,
  onSort,
}: {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground" />;
    return sortDirection === "asc"
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/50 sticky top-0 z-10">
      <div className={COLUMN_WIDTHS.sku}>SKU</div>
      <button className={`${COLUMN_WIDTHS.title} flex items-center gap-1 text-left`} onClick={() => onSort("title")}>
        Product <SortIcon field="title" />
      </button>
      <div className={COLUMN_WIDTHS.category}>Category</div>
      <button className={`${COLUMN_WIDTHS.price} flex items-center gap-1`} onClick={() => onSort("price")}>
        Price <SortIcon field="price" />
      </button>
      <button className={`${COLUMN_WIDTHS.stock} flex items-center gap-1`} onClick={() => onSort("currentStock")}>
        Stock <SortIcon field="currentStock" />
      </button>
      <div className={COLUMN_WIDTHS.status}>Status</div>
      <button className={`${COLUMN_WIDTHS.days} flex items-center gap-1`} onClick={() => onSort("daysOfStockLeft")}>
        Days Left <SortIcon field="daysOfStockLeft" />
      </button>
      <button className={`${COLUMN_WIDTHS.velocity} flex items-center gap-1`} onClick={() => onSort("avgDailySales")}>
        Vel/Day <SortIcon field="avgDailySales" />
      </button>
      <div className={COLUMN_WIDTHS.fulfillment}>Type</div>
      <button className={`${COLUMN_WIDTHS.rating} flex items-center gap-1`} onClick={() => onSort("rating")}>
        Rating <SortIcon field="rating" />
      </button>
    </div>
  );
}

export function InventoryTable({ products, isLoading, containerHeight = 600 }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("daysOfStockLeft");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const lc = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lc) ||
          p.sku.toLowerCase().includes(lc) ||
          p.asin.toLowerCase().includes(lc)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (fulfillmentFilter !== "all") {
      result = result.filter((p) => p.fulfillment === fulfillmentFilter);
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === "string"
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return result;
  }, [products, search, categoryFilter, statusFilter, fulfillmentFilter, sortField, sortDirection]);

  const rowProps = useMemo(() => ({ items: filtered }) as any, [filtered]);

  const Row = useCallback(
    ({ index, style, items }: { index: number; style: React.CSSProperties; items: Product[] }) => {
      const p = items[index];
      if (!p) return null;
      const isRisk = p.daysOfStockLeft <= 7 && p.daysOfStockLeft > 0;
      const isOOS = p.status === "Out of Stock";

      return (
        <div
          style={style}
          className={`flex items-center gap-3 px-4 text-sm border-b transition-colors ${
            isOOS
              ? "bg-destructive/5"
              : isRisk
              ? "bg-chart-5/5"
              : "hover-elevate"
          }`}
          data-testid={`row-product-${p.id}`}
        >
          <div className={`${COLUMN_WIDTHS.sku} text-xs font-mono text-muted-foreground truncate`}>
            {p.sku}
          </div>
          <div className={`${COLUMN_WIDTHS.title} truncate`}>
            <span className="font-medium">{p.title}</span>
          </div>
          <div className={`${COLUMN_WIDTHS.category} text-xs text-muted-foreground truncate`}>
            {p.category}
          </div>
          <div className={COLUMN_WIDTHS.price}>
            ${p.price.toFixed(2)}
          </div>
          <div className={`${COLUMN_WIDTHS.stock} flex items-center gap-2`}>
            <span className="text-xs w-10 text-right tabular-nums">{p.currentStock}</span>
            <StockBar current={p.currentStock} max={p.maxStock} reorder={p.reorderPoint} />
          </div>
          <div className={COLUMN_WIDTHS.status}>
            {getStatusBadge(p.status)}
          </div>
          <div className={`${COLUMN_WIDTHS.days} tabular-nums ${getDaysOfStockColor(p.daysOfStockLeft)}`}>
            {p.daysOfStockLeft === 0 ? "OOS" : `${p.daysOfStockLeft}d`}
          </div>
          <div className={`${COLUMN_WIDTHS.velocity} tabular-nums text-muted-foreground`}>
            {p.avgDailySales}
          </div>
          <div className={COLUMN_WIDTHS.fulfillment}>
            <Badge variant="outline" className="text-[10px] font-mono">
              {p.fulfillment}
            </Badge>
          </div>
          <div className={`${COLUMN_WIDTHS.rating} flex items-center gap-1 text-xs`}>
            <Star className="w-3 h-3 fill-chart-5 text-chart-5" />
            <span className="tabular-nums">{p.rating}</span>
            <span className="text-muted-foreground">({p.reviewCount > 999 ? `${(p.reviewCount / 1000).toFixed(1)}k` : p.reviewCount})</span>
          </div>
        </div>
      );
    },
    []
  );

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-3 border-b space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, SKU, or ASIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-inventory"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {productCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {stockStatuses.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
            <SelectTrigger className="w-[100px]" data-testid="select-fulfillment-filter">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {fulfillmentTypes.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length.toLocaleString()}</span> of{" "}
            <span className="font-medium text-foreground">{products.length.toLocaleString()}</span> products
          </p>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Virtualized rendering</span>
          </div>
        </div>
      </div>
      <TableHeader sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
      <List
        style={{ height: containerHeight }}
        rowCount={filtered.length}
        rowHeight={44}
        overscanCount={20}
        rowComponent={Row}
        rowProps={rowProps}
      />
    </Card>
  );
}
