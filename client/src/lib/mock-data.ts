import type { Product, SalesDataPoint, ThunderingHerdEvent, DashboardStats } from "@shared/schema";
import { productCategories, fulfillmentTypes } from "@shared/schema";

const vendors = [
  "Shenzhen Electronics Co.",
  "Pacific Trade Group",
  "Alpine Supply Chain",
  "Eastern Distribution LLC",
  "WestCoast Imports",
  "GlobalSource Partners",
  "TechBridge Supply",
  "PrimePath Logistics",
  "OceanLink Trading",
  "SwiftFulfill Inc.",
];

const adjectives = [
  "Premium", "Ultra", "Pro", "Essential", "Advanced", "Classic", "Elite",
  "Smart", "Eco", "Max", "Plus", "Deluxe", "Compact", "Heavy-Duty", "Wireless",
];

const nouns: Record<string, string[]> = {
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

function generateSKU(category: string, index: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(6, "0")}`;
}

export function generateProducts(count: number): Product[] {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const category = randomFrom(productCategories);
    const categoryNouns = nouns[category] || nouns["Electronics"];
    const noun = randomFrom(categoryNouns);
    const adj = randomFrom(adjectives);
    const title = `${adj} ${noun}`;

    const price = Math.round((Math.random() * 200 + 5) * 100) / 100;
    const cost = Math.round(price * (0.3 + Math.random() * 0.4) * 100) / 100;
    const currentStock = Math.floor(Math.random() * 500);
    const maxStock = Math.floor(Math.random() * 500) + 200;
    const reorderPoint = Math.floor(maxStock * 0.15);
    const avgDailySales = Math.round((Math.random() * 30 + 0.5) * 10) / 10;
    const daysOfStockLeft = currentStock > 0 ? Math.round(currentStock / avgDailySales * 10) / 10 : 0;

    const last7DaySales = Array.from({ length: 7 }, () =>
      Math.floor(avgDailySales * (0.5 + Math.random()))
    );
    const last30DaySales = Math.floor(avgDailySales * 30 * (0.8 + Math.random() * 0.4));

    let status: Product["status"];
    if (currentStock === 0) status = "Out of Stock";
    else if (currentStock <= reorderPoint) status = "Low Stock";
    else if (currentStock >= maxStock * 0.9) status = "Overstock";
    else status = "In Stock";

    const daysAgo = Math.floor(Math.random() * 30);
    const lastUpdated = new Date(Date.now() - daysAgo * 86400000).toISOString();

    products.push({
      id: `prod_${String(i).padStart(6, "0")}`,
      asin: generateASIN(),
      sku: generateSKU(category, i),
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
      lastUpdated,
      version: 1,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 5000),
    });
  }

  return products;
}

export function generateSalesData(days: number): SalesDataPoint[] {
  const data: SalesDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const baseSales = 150 + Math.sin(i * 0.3) * 40;
    const sales = Math.floor(baseSales + Math.random() * 60);
    const avgPrice = 25 + Math.random() * 15;
    data.push({
      date: date.toISOString().split("T")[0],
      sales,
      revenue: Math.round(sales * avgPrice * 100) / 100,
      orders: Math.floor(sales * (0.6 + Math.random() * 0.3)),
    });
  }
  return data;
}

export function generateHerdEvents(count: number): ThunderingHerdEvent[] {
  const strategies = ["last-write-wins", "highest-stock", "average", "reject"];
  const events: ThunderingHerdEvent[] = [];
  for (let i = 0; i < count; i++) {
    const hoursAgo = Math.floor(Math.random() * 72);
    events.push({
      id: `herd_${i}`,
      timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      vendorCount: Math.floor(Math.random() * 8) + 2,
      productsAffected: Math.floor(Math.random() * 50) + 5,
      conflictsDetected: Math.floor(Math.random() * 30) + 1,
      resolved: Math.random() > 0.1,
      strategy: randomFrom(strategies),
      duration: Math.floor(Math.random() * 2000) + 100,
    });
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function computeDashboardStats(products: Product[]): DashboardStats {
  const totalProducts = products.length;
  const totalValue = products.reduce((s, p) => s + p.price * p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length;
  const avgDaysOfStock = products.reduce((s, p) => s + p.daysOfStockLeft, 0) / totalProducts;
  const salesVelocity = products.reduce((s, p) => s + p.avgDailySales, 0);
  return {
    totalProducts,
    totalValue: Math.round(totalValue),
    lowStockCount,
    outOfStockCount,
    avgDaysOfStock: Math.round(avgDaysOfStock * 10) / 10,
    totalConflicts: 0,
    resolvedConflicts: 0,
    salesVelocity: Math.round(salesVelocity),
  };
}
