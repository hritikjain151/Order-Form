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

export async function seedDatabase() {
  const existing = await storage.getPurchaseOrders();
  if (existing.length === 0) {
    await storage.createPurchaseOrder({
      poNumber: "PO-001-2025",
      vendorName: "RUBBER METSO",
      orderDate: new Date(),
      materialNumber: "MAT-12345",
      drawingNumber: "DWG-67890",
      partName: "Rubber Seal Assembly",
      description: "High-quality rubber seals for industrial equipment",
      importantRemarks: "Handle with care - keep in dry storage",
      quantity: 100,
      price: 2500,
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      remarks: "Urgent delivery requested for production line setup"
    });

    await storage.createPurchaseOrder({
      poNumber: "PO-002-2025",
      vendorName: "SCREEN DEVELOPEMENT METSO",
      orderDate: new Date(),
      materialNumber: "MAT-54321",
      drawingNumber: "DWG-11111",
      partName: "Screen Panel Assembly",
      description: "Development model screen panels with specifications",
      importantRemarks: "Prototype - do not use for production",
      quantity: 50,
      price: 5000,
      deliveryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      remarks: "For testing and development purposes only"
    });
  }
}
