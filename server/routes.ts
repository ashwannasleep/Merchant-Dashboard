import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stockUpdateSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/products", (_req, res) => {
    const products = storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.get("/api/stats", (_req, res) => {
    const stats = storage.getStats();
    res.json(stats);
  });

  app.get("/api/sales", (_req, res) => {
    const salesData = storage.getSalesData();
    res.json(salesData);
  });

  app.get("/api/herd-events", (_req, res) => {
    const events = storage.getHerdEvents();
    res.json(events);
  });

  app.post("/api/stock-update", (req, res) => {
    const parsed = stockUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid stock update", errors: parsed.error.errors });
    }
    const result = storage.updateStock(parsed.data);
    res.json(result);
  });

  app.post("/api/simulate-herd", (_req, res) => {
    const event = storage.simulateThunderingHerd();
    res.json(event);
  });

  return httpServer;
}
