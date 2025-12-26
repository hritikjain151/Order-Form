import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, createPurchaseOrderWithItemsSchema } from "@shared/routes";
import { insertItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Items routes
  app.get(api.items.list.path, async (req, res) => {
    const allItems = await storage.getItems();
    res.json(allItems);
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = insertItemSchema.parse(req.body);
      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else if (err instanceof Error && err.message.includes('already exists')) {
        res.status(409).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Purchase Orders routes
  app.get(api.purchaseOrders.list.path, async (req, res) => {
    const pos = await storage.getPurchaseOrders();
    res.json(pos);
  });

  app.post(api.purchaseOrders.create.path, async (req, res) => {
    try {
      const input = createPurchaseOrderWithItemsSchema.parse(req.body);
      const { items: itemsData, ...poData } = input;
      
      // Fetch full item data for each selected item
      const itemsWithFullData = await Promise.all(
        itemsData.map(async (itemInput) => {
          const item = await storage.getItemByMaterialNumber(
            // We need to get the item - but itemInput only has itemId
            // Actually, in the form we'll pass itemId directly
            String(itemInput.itemId)
          );
          if (!item) throw new Error('Item not found');
          return { ...itemInput, item };
        })
      );

      const po = await storage.createPurchaseOrder(poData, itemsWithFullData);
      res.status(201).json(po);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: (err as Error).message || "Internal server error" });
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
  const existing = await storage.getItems();
  if (existing.length === 0) {
    // Create sample items
    const item1 = await storage.createItem({
      materialNumber: "MAT-12345",
      vendorName: "RUBBER METSO",
      drawingNumber: "DWG-67890",
      itemName: "Rubber Seal Assembly",
      description: "High-quality rubber seals for industrial equipment",
      specialRemarks: "Handle with care - keep in dry storage",
      price: "25.00",
      weight: "0.5",
    });

    const item2 = await storage.createItem({
      materialNumber: "MAT-12346",
      vendorName: "RUBBER METSO",
      drawingNumber: "DWG-67891",
      itemName: "Rubber Gasket",
      description: "Premium gaskets for sealing applications",
      specialRemarks: "Store in cool, dry place",
      price: "15.50",
      weight: "0.3",
    });

    // Create sample purchase orders
    await storage.createPurchaseOrder(
      {
        poNumber: "PO-001-2025",
        department: "Operations",
        vendorName: "RUBBER METSO",
        orderDate: new Date(),
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        remarks: "Urgent delivery requested for production line setup"
      },
      [
        {
          itemId: item1.id,
          quantity: 100,
          item: item1,
        },
        {
          itemId: item2.id,
          quantity: 50,
          item: item2,
        }
      ]
    );

    const item3 = await storage.createItem({
      materialNumber: "MAT-54321",
      vendorName: "SCREEN DEVELOPEMENT METSO",
      drawingNumber: "DWG-11111",
      itemName: "Screen Panel Assembly",
      description: "Development model screen panels with specifications",
      specialRemarks: "Prototype - do not use for production",
      price: "100.00",
      weight: "2.0",
    });

    await storage.createPurchaseOrder(
      {
        poNumber: "PO-002-2025",
        department: "Sales",
        vendorName: "SCREEN DEVELOPEMENT METSO",
        orderDate: new Date(),
        deliveryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        remarks: "For testing and development purposes only"
      },
      [
        {
          itemId: item3.id,
          quantity: 50,
          item: item3,
        }
      ]
    );
  }
}
