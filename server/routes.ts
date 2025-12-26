import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.purchaseOrders.list.path, async (req, res) => {
    const pos = await storage.getPurchaseOrders();
    res.json(pos);
  });

  app.post(api.purchaseOrders.create.path, async (req, res) => {
    try {
      const input = api.purchaseOrders.create.input.parse(req.body);
      const po = await storage.createPurchaseOrder(input);
      res.status(201).json(po);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.purchaseOrders.get.path, async (req, res) => {
    const po = await storage.getPurchaseOrder(Number(req.params.id));
    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    res.json(po);
  });

  return httpServer;
}

// Seed function to be called from index.ts or handled via a separate script
export async function seedDatabase() {
  const existing = await storage.getPurchaseOrders();
  if (existing.length === 0) {
    await storage.createPurchaseOrder({
      poNumber: "123456789012",
      vendorName: "Acme Corp",
      orderDate: new Date(),
      totalAmount: 5000,
      description: "Office Supplies",
      department: "Admin",
      requesterName: "John Doe",
      status: "Pending",
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      remarks: "Urgent delivery requested"
    });
  }
}
