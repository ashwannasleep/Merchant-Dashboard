import type { Product, DashboardStats, SalesDataPoint, ThunderingHerdEvent, StockUpdate, ConflictResolution } from "@shared/schema";
import { productCategories, fulfillmentTypes } from "@shared/schema";
import { randomUUID } from "crypto";

const vendors = [
  "Shenzhen Electronics Co.", "Pacific Trade Group", "Alpine Supply Chain",
  "Eastern Distribution LLC", "WestCoast Imports", "GlobalSource Partners",
  "TechBridge Supply", "PrimePath Logistics", "OceanLink Trading", "SwiftFulfill Inc.",
];

const adjectives = [
  "Premium", "Ultra", "Pro", "Essential", "Advanced", "Classic", "Elite",
  "Smart", "Eco", "Max", "Plus", "Deluxe", "Compact", "Heavy-Duty", "Wireless",
];

const nounsByCategory: Record<string, string[]> = {
  Electronics: ["Bluetooth Speaker", "USB-C Hub", "Wireless Charger", "Power Bank", "Smart Watch", "Earbuds", "Webcam", "LED Strip"],
  "Home & Kitchen": ["Air Fryer", "Knife Set", "Blender", "Coffee Maker", "Cutting Board", "Spice Rack", "Dish Rack", "Pan Set"],
  Clothing: ["T-Shirt", "Hoodie", "Jacket", "Jeans", "Sneakers", "Cap", "Socks Pack", "Belt"],
  Books: ["Cookbook", "Novel", "Textbook", "Journal", "Planner", "Guide", "Workbook", "Atlas"],
  "Toys & Games": ["Board Game", "Puzzle Set", "Action Figure", "Building Blocks", "Card Game", "Drone", "RC Car", "Dollhouse"],
  "Sports & Outdoors": ["Yoga Mat", "Dumbbells", "Water Bottle", "Camping Tent", "Hiking Boots", "Resistance Bands", "Bike Light", "Jump Rope"],
  "Beauty & Personal Care": ["Face Cream", "Shampoo", "Sunscreen", "Lip Balm", "Hair Dryer", "Nail Kit", "Perfume", "Eye Cream"],
  "Health & Household": ["Vitamins", "First Aid Kit", "Thermometer", "Hand Sanitizer", "Air Purifier", "Humidifier", "Scale", "Pillow"],
  Automotive: ["Dash Cam", "Car Charger", "Floor Mats", "Phone Mount", "LED Bulbs", "Tire Gauge", "Seat Cover", "Air Freshener"],
  "Pet Supplies": ["Dog Bed", "Cat Toy", "Pet Carrier", "Food Bowl", "Leash", "Grooming Kit", "Treats", "Collar"],
  "Office Products": ["Desk Organizer", "Stapler", "Notebooks", "Markers", "Label Maker", "Paper Shredder", "Desk Lamp", "Folder Set"],
  "Tools & Home Improvement": ["Drill Set", "Screwdriver Kit", "Tape Measure", "Level", "Wrench Set", "Pliers", "Flashlight", "Toolbox"],
  "Grocery & Gourmet": ["Olive Oil", "Protein Bars", "Tea Set", "Spice Mix", "Honey", "Granola", "Pasta", "Coffee Beans"],
  "Baby Products": ["Baby Monitor", "Diaper Bag", "Stroller", "High Chair", "Bottle Set", "Pacifier", "Car Seat", "Crib Sheet"],
  "Garden & Outdoor": ["Garden Hose", "Planter", "Solar Lights", "Bird Feeder", "Pruning Shears", "Compost Bin", "Trowel", "Watering Can"],
};

function randomFrom<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateASIN(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "B0" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export interface IStorage {
  getProducts(): Product[];
  getProduct(id: string): Product | undefined;
  getStats(): DashboardStats;
  getSalesData(): SalesDataPoint[];
  getHerdEvents(): ThunderingHerdEvent[];
  updateStock(update: StockUpdate): { success: boolean; conflict: boolean; resolution?: ConflictResolution };
  simulateThunderingHerd(): ThunderingHerdEvent;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private salesData: SalesDataPoint[];
  private herdEvents: ThunderingHerdEvent[];
  private pendingUpdates: Map<string, StockUpdate[]>;

  constructor() {
    this.products = new Map();
    this.salesData = [];
    this.herdEvents = [];
    this.pendingUpdates = new Map();
    this.seedProducts(10000);
    this.seedSalesData(30);
  }

  private seedProducts(count: number) {
    for (let i = 0; i < count; i++) {
      const category = randomFrom(productCategories);
      const categoryNouns = nounsByCategory[category] || nounsByCategory["Electronics"];
      const title = `${randomFrom(adjectives)} ${randomFrom(categoryNouns)}`;
      const price = Math.round((Math.random() * 200 + 5) * 100) / 100;
      const cost = Math.round(price * (0.3 + Math.random() * 0.4) * 100) / 100;
      const currentStock = Math.floor(Math.random() * 500);
      const maxStock = Math.floor(Math.random() * 500) + 200;
      const reorderPoint = Math.floor(maxStock * 0.15);
      const avgDailySales = Math.round((Math.random() * 30 + 0.5) * 10) / 10;
      const daysOfStockLeft = currentStock > 0 ? Math.round((currentStock / avgDailySales) * 10) / 10 : 0;
      const last7DaySales = Array.from({ length: 7 }, () => Math.floor(avgDailySales * (0.5 + Math.random())));
      const last30DaySales = Math.floor(avgDailySales * 30 * (0.8 + Math.random() * 0.4));

      let status: Product["status"];
      if (currentStock === 0) status = "Out of Stock";
      else if (currentStock <= reorderPoint) status = "Low Stock";
      else if (currentStock >= maxStock * 0.9) status = "Overstock";
      else status = "In Stock";

      const id = `prod_${String(i).padStart(6, "0")}`;
      this.products.set(id, {
        id,
        asin: generateASIN(),
        sku: `${category.substring(0, 3).toUpperCase()}-${String(i).padStart(6, "0")}`,
        title,
        category,
        price,
        cost,
        currentStock,
        reorderPoint,
        maxStock,
        fulfillment: randomFrom(fulfillmentTypes),
        status,
        avgDailySales,
        last7DaySales,
        last30DaySales,
        daysOfStockLeft,
        vendor: randomFrom(vendors),
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
        version: 1,
        rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 5000),
      });
    }
  }

  private seedSalesData(days: number) {
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const baseSales = 150 + Math.sin(i * 0.3) * 40;
      const sales = Math.floor(baseSales + Math.random() * 60);
      const avgPrice = 25 + Math.random() * 15;
      this.salesData.push({
        date: date.toISOString().split("T")[0],
        sales,
        revenue: Math.round(sales * avgPrice * 100) / 100,
        orders: Math.floor(sales * (0.6 + Math.random() * 0.3)),
      });
    }
  }

  getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  getStats(): DashboardStats {
    const products = this.getProducts();
    const totalProducts = products.length;
    const totalValue = products.reduce((s, p) => s + p.price * p.currentStock, 0);
    const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
    const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length;
    const avgDaysOfStock = products.reduce((s, p) => s + p.daysOfStockLeft, 0) / totalProducts;
    const salesVelocity = products.reduce((s, p) => s + p.avgDailySales, 0);
    const totalConflicts = this.herdEvents.reduce((s, e) => s + e.conflictsDetected, 0);
    const resolvedConflicts = this.herdEvents.filter((e) => e.resolved).reduce((s, e) => s + e.conflictsDetected, 0);

    return {
      totalProducts,
      totalValue: Math.round(totalValue),
      lowStockCount,
      outOfStockCount,
      avgDaysOfStock: Math.round(avgDaysOfStock * 10) / 10,
      totalConflicts,
      resolvedConflicts,
      salesVelocity: Math.round(salesVelocity),
    };
  }

  getSalesData(): SalesDataPoint[] {
    return this.salesData;
  }

  getHerdEvents(): ThunderingHerdEvent[] {
    return this.herdEvents;
  }

  updateStock(update: StockUpdate): { success: boolean; conflict: boolean; resolution?: ConflictResolution } {
    const product = this.products.get(update.productId);
    if (!product) {
      return { success: false, conflict: false };
    }

    if (product.version !== update.version) {
      const pending = this.pendingUpdates.get(update.productId) || [];
      pending.push(update);
      this.pendingUpdates.set(update.productId, pending);

      const resolution = this.resolveConflict(update.productId, pending);

      const event: ThunderingHerdEvent = {
        id: `herd_${this.herdEvents.length}`,
        timestamp: new Date().toISOString(),
        vendorCount: pending.length,
        productsAffected: 1,
        conflictsDetected: 1,
        resolved: true,
        strategy: resolution.strategy,
        duration: Math.floor(Math.random() * 200) + 10,
      };
      this.herdEvents.unshift(event);

      return { success: true, conflict: true, resolution };
    }

    product.currentStock = update.newStock;
    product.version++;
    product.lastUpdated = new Date().toISOString();
    this.updateProductStatus(product);
    return { success: true, conflict: false };
  }

  private resolveConflict(productId: string, updates: StockUpdate[]): ConflictResolution {
    const product = this.products.get(productId)!;
    const strategies = ["last-write-wins", "highest-stock", "average", "reject"] as const;
    const strategy = strategies[Math.floor(Math.random() * 3)];

    let resolvedStock: number;
    switch (strategy) {
      case "last-write-wins":
        resolvedStock = updates[updates.length - 1].newStock;
        break;
      case "highest-stock":
        resolvedStock = Math.max(...updates.map((u) => u.newStock));
        break;
      case "average":
        resolvedStock = Math.round(updates.reduce((s, u) => s + u.newStock, 0) / updates.length);
        break;
      default:
        resolvedStock = product.currentStock;
    }

    product.currentStock = resolvedStock;
    product.version++;
    product.lastUpdated = new Date().toISOString();
    this.updateProductStatus(product);
    this.pendingUpdates.delete(productId);

    return {
      productId,
      updates,
      resolvedStock,
      strategy,
      timestamp: new Date().toISOString(),
    };
  }

  private updateProductStatus(product: Product) {
    if (product.currentStock === 0) product.status = "Out of Stock";
    else if (product.currentStock <= product.reorderPoint) product.status = "Low Stock";
    else if (product.currentStock >= product.maxStock * 0.9) product.status = "Overstock";
    else product.status = "In Stock";
    product.daysOfStockLeft = product.currentStock > 0
      ? Math.round((product.currentStock / product.avgDailySales) * 10) / 10
      : 0;
  }

  simulateThunderingHerd(): ThunderingHerdEvent {
    const vendorCount = Math.floor(Math.random() * 8) + 2;
    const productsAffected = Math.floor(Math.random() * 50) + 5;
    const allProducts = this.getProducts();
    const targetProducts = allProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, productsAffected);

    let conflictsDetected = 0;
    const strategies = ["last-write-wins", "highest-stock", "average"] as const;
    const chosenStrategy = randomFrom(strategies);
    const startTime = Date.now();

    for (const product of targetProducts) {
      const concurrentUpdates: StockUpdate[] = [];
      for (let v = 0; v < vendorCount; v++) {
        concurrentUpdates.push({
          productId: product.id,
          vendorId: `vendor_${v}`,
          newStock: Math.floor(Math.random() * product.maxStock),
          version: product.version,
        });
      }

      if (concurrentUpdates.length > 1) {
        conflictsDetected++;
        let resolvedStock: number;
        switch (chosenStrategy) {
          case "last-write-wins":
            resolvedStock = concurrentUpdates[concurrentUpdates.length - 1].newStock;
            break;
          case "highest-stock":
            resolvedStock = Math.max(...concurrentUpdates.map((u) => u.newStock));
            break;
          case "average":
            resolvedStock = Math.round(concurrentUpdates.reduce((s, u) => s + u.newStock, 0) / concurrentUpdates.length);
            break;
        }

        product.currentStock = resolvedStock;
        product.version++;
        product.lastUpdated = new Date().toISOString();
        this.updateProductStatus(product);
      }
    }

    const duration = Date.now() - startTime + Math.floor(Math.random() * 500);
    const event: ThunderingHerdEvent = {
      id: `herd_${this.herdEvents.length}`,
      timestamp: new Date().toISOString(),
      vendorCount,
      productsAffected,
      conflictsDetected,
      resolved: true,
      strategy: chosenStrategy,
      duration,
    };

    this.herdEvents.unshift(event);
    return event;
  }
}

export const storage = new MemStorage();
