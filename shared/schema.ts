import { z } from "zod";

export const productCategories = [
  "Electronics",
  "Home & Kitchen",
  "Clothing",
  "Books",
  "Toys & Games",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Health & Household",
  "Automotive",
  "Pet Supplies",
  "Office Products",
  "Tools & Home Improvement",
  "Grocery & Gourmet",
  "Baby Products",
  "Garden & Outdoor",
] as const;

export const fulfillmentTypes = ["FBA", "FBM", "SFP"] as const;

export const stockStatuses = [
  "In Stock",
  "Low Stock",
  "Out of Stock",
  "Overstock",
] as const;

export const productSchema = z.object({
  id: z.string(),
  asin: z.string(),
  sku: z.string(),
  title: z.string(),
  category: z.enum(productCategories),
  price: z.number(),
  cost: z.number(),
  currentStock: z.number(),
  reorderPoint: z.number(),
  maxStock: z.number(),
  fulfillment: z.enum(fulfillmentTypes),
  status: z.enum(stockStatuses),
  avgDailySales: z.number(),
  last7DaySales: z.number().array(),
  last30DaySales: z.number(),
  daysOfStockLeft: z.number(),
  vendor: z.string(),
  lastUpdated: z.string(),
  version: z.number(),
  rating: z.number(),
  reviewCount: z.number(),
});

export type Product = z.infer<typeof productSchema>;

export const stockUpdateSchema = z.object({
  productId: z.string(),
  vendorId: z.string(),
  newStock: z.number(),
  version: z.number(),
});

export type StockUpdate = z.infer<typeof stockUpdateSchema>;

export const conflictResolutionSchema = z.object({
  productId: z.string(),
  updates: z.array(stockUpdateSchema),
  resolvedStock: z.number(),
  strategy: z.enum(["last-write-wins", "highest-stock", "average", "reject"]),
  timestamp: z.string(),
});

export type ConflictResolution = z.infer<typeof conflictResolutionSchema>;

export const dashboardStatsSchema = z.object({
  totalProducts: z.number(),
  totalValue: z.number(),
  lowStockCount: z.number(),
  outOfStockCount: z.number(),
  avgDaysOfStock: z.number(),
  totalConflicts: z.number(),
  resolvedConflicts: z.number(),
  salesVelocity: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const salesDataPointSchema = z.object({
  date: z.string(),
  sales: z.number(),
  revenue: z.number(),
  orders: z.number(),
});

export type SalesDataPoint = z.infer<typeof salesDataPointSchema>;

export const thunderingHerdEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  vendorCount: z.number(),
  productsAffected: z.number(),
  conflictsDetected: z.number(),
  resolved: z.boolean(),
  strategy: z.string(),
  duration: z.number(),
});

export type ThunderingHerdEvent = z.infer<typeof thunderingHerdEventSchema>;

export const users = undefined;
export type InsertUser = { username: string; password: string };
export type User = { id: string; username: string; password: string };
