import { QueryClient, QueryFunction } from "@tanstack/react-query";
import type {
  DashboardStats,
  Product,
  SalesDataPoint,
  StockUpdate,
  ThunderingHerdEvent,
} from "@shared/schema";
import {
  computeDashboardStats,
  generateHerdEvents,
  generateProducts,
  generateSalesData,
} from "./mock-data";

const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === "true";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type MockState = {
  products: Product[];
  salesData: SalesDataPoint[];
  herdEvents: ThunderingHerdEvent[];
};

let mockState: MockState | null = null;

function getMockState(): MockState {
  if (!mockState) {
    mockState = {
      products: generateProducts(10000),
      salesData: generateSalesData(30),
      herdEvents: generateHerdEvents(8),
    };
  }
  return mockState;
}

function parsePath(url: string): string {
  if (url.startsWith("/")) {
    return url;
  }
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function updateProductStatus(product: Product) {
  if (product.currentStock === 0) product.status = "Out of Stock";
  else if (product.currentStock <= product.reorderPoint) product.status = "Low Stock";
  else if (product.currentStock >= product.maxStock * 0.9) product.status = "Overstock";
  else product.status = "In Stock";

  product.daysOfStockLeft = product.currentStock > 0
    ? Math.round((product.currentStock / product.avgDailySales) * 10) / 10
    : 0;
}

function computeStats(state: MockState): DashboardStats {
  const baseStats = computeDashboardStats(state.products);
  const totalConflicts = state.herdEvents.reduce((sum, event) => sum + event.conflictsDetected, 0);
  const resolvedConflicts = state.herdEvents
    .filter((event) => event.resolved)
    .reduce((sum, event) => sum + event.conflictsDetected, 0);

  return {
    ...baseStats,
    totalConflicts,
    resolvedConflicts,
  };
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function simulateHerdEvent(state: MockState): ThunderingHerdEvent {
  const vendorCount = Math.floor(Math.random() * 8) + 2;
  const productsAffected = Math.floor(Math.random() * 50) + 5;
  const strategy = pickRandom(["last-write-wins", "highest-stock", "average"] as const);
  const targetProducts = [...state.products].sort(() => Math.random() - 0.5).slice(0, productsAffected);

  let conflictsDetected = 0;
  const startedAt = Date.now();

  for (const product of targetProducts) {
    const updates = Array.from({ length: vendorCount }, () =>
      Math.floor(Math.random() * Math.max(product.maxStock, 1)),
    );
    if (updates.length < 2) continue;

    conflictsDetected++;
    let resolvedStock = product.currentStock;
    switch (strategy) {
      case "last-write-wins":
        resolvedStock = updates[updates.length - 1];
        break;
      case "highest-stock":
        resolvedStock = Math.max(...updates);
        break;
      case "average":
        resolvedStock = Math.round(updates.reduce((sum, value) => sum + value, 0) / updates.length);
        break;
    }

    product.currentStock = resolvedStock;
    product.version += 1;
    product.lastUpdated = new Date().toISOString();
    updateProductStatus(product);
  }

  const event: ThunderingHerdEvent = {
    id: `herd_${state.herdEvents.length}`,
    timestamp: new Date().toISOString(),
    vendorCount,
    productsAffected,
    conflictsDetected,
    resolved: true,
    strategy,
    duration: Date.now() - startedAt + Math.floor(Math.random() * 200),
  };

  state.herdEvents.unshift(event);
  return event;
}

function isStockUpdate(payload: unknown): payload is StockUpdate {
  if (!payload || typeof payload !== "object") return false;
  const obj = payload as Record<string, unknown>;
  return (
    typeof obj.productId === "string" &&
    typeof obj.vendorId === "string" &&
    typeof obj.newStock === "number" &&
    typeof obj.version === "number"
  );
}

function applyStockUpdate(state: MockState, payload: unknown) {
  if (!isStockUpdate(payload)) {
    throw new HttpError(400, "Invalid stock update");
  }

  const product = state.products.find((item) => item.id === payload.productId);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const hasConflict = product.version !== payload.version;
  if (!hasConflict) {
    product.currentStock = payload.newStock;
    product.version += 1;
    product.lastUpdated = new Date().toISOString();
    updateProductStatus(product);
  }

  return { success: true, conflict: hasConflict };
}

function readMockData(url: string) {
  const path = parsePath(url);
  const state = getMockState();

  if (path === "/api/products") return state.products;
  if (path.startsWith("/api/products/")) {
    const productId = path.replace("/api/products/", "");
    const product = state.products.find((item) => item.id === productId);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }
  if (path === "/api/stats") return computeStats(state);
  if (path === "/api/sales") return state.salesData;
  if (path === "/api/herd-events") return state.herdEvents;

  throw new HttpError(404, `No mock handler for ${path}`);
}

function writeMockData(method: string, url: string, payload?: unknown) {
  const path = parsePath(url);
  const state = getMockState();

  if (method === "POST" && path === "/api/simulate-herd") {
    return simulateHerdEvent(state);
  }
  if (method === "POST" && path === "/api/stock-update") {
    return applyStockUpdate(state, payload);
  }

  throw new HttpError(404, `No mock handler for ${method} ${path}`);
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (STATIC_MODE && url.startsWith("/api/")) {
    try {
      const payload = writeMockData(method.toUpperCase(), url, data);
      return jsonResponse(payload);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse({ message: error.message }, error.status);
      }
      return jsonResponse({ message: "Mock API request failed" }, 500);
    }
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    if (STATIC_MODE && url.startsWith("/api/")) {
      return readMockData(url) as T;
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
