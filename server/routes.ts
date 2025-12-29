import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, createPurchaseOrderWithItemsSchema } from "@shared/routes";
import { insertItemSchema, insertPurchaseOrderItemSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

declare module "express-session" {
  interface SessionData {
    isAuthenticated: boolean;
    userId: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.set("trust proxy", 1);

  const PgStore = connectPgSimple(session);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
        errorLog: () => {},
      }),
      secret: process.env.SESSION_SECRET || "procureflow-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/login", async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "User ID and password are required" });
    }

    try {
      const user = await storage.getUserByUserId(userId);
      if (user && user.isActive === 1 && user.password === password) {
        req.session.isAuthenticated = true;
        req.session.userId = user.userId;
        return res.json({ success: true, message: "Login successful" });
      }
      return res.status(401).json({ message: "Invalid user ID or password" });
    } catch (err) {
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({
      isAuthenticated: !!req.session.isAuthenticated,
      userId: req.session.userId || null,
    });
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allPOs = await storage.getPurchaseOrdersWithItems();
      
      let oldestPendingDate: string | null = null;
      let pendingItemsCount = 0;
      const monthlyDispatchedWeight: Record<string, number> = {};

      for (const po of allPOs) {
        let poHasPendingItems = false;
        
        for (const poItem of po.items) {
          let processes: Array<{ stage: string; completed: boolean }> = [];
          try {
            processes = JSON.parse(poItem.processes || "[]");
          } catch {
            processes = [];
          }
          const lastStage = processes[processes.length - 1];
          const isCompleted = lastStage?.completed === true;
          
          if (!isCompleted) {
            pendingItemsCount++;
            poHasPendingItems = true;
          } else {
            // Item is dispatched - add weight to monthly totals
            const dispatchDate = new Date(po.deliveryDate || po.orderDate);
            const monthKey = `${dispatchDate.getFullYear()}-${String(dispatchDate.getMonth() + 1).padStart(2, '0')}`;
            const itemWeight = parseFloat(poItem.item?.weight || "0") * poItem.quantity;
            monthlyDispatchedWeight[monthKey] = (monthlyDispatchedWeight[monthKey] || 0) + itemWeight;
          }
        }
        
        if (poHasPendingItems) {
          const poDate = new Date(po.orderDate).toISOString();
          if (!oldestPendingDate || poDate < oldestPendingDate) {
            oldestPendingDate = poDate;
          }
        }
      }

      // Convert monthly data to sorted array
      const monthlyData = Object.entries(monthlyDispatchedWeight)
        .map(([month, weight]) => ({ month, weight: Math.round(weight * 100) / 100 }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.json({
        oldestPendingDate,
        pendingItemsCount,
        monthlyDispatchedWeight: monthlyData,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    const allUsers = await storage.getUsers();
    const usersWithoutPassword = allUsers.map(({ password, ...user }) => user);
    res.json(usersWithoutPassword);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const user = await storage.createUser(input);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
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

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, input);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ message: err.message });
      } else if (err instanceof Error && err.message.includes('already exists')) {
        res.status(409).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

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

  app.patch(api.items.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertItemSchema.parse(req.body);
      const item = await storage.updateItem(id, input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ message: err.message });
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
          const item = await storage.getItemById(itemInput.itemId);
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

  app.patch(api.purchaseOrders.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertPurchaseOrderSchema.parse(req.body);
      const po = await storage.updatePurchaseOrder(id, input);
      res.json(po);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.purchaseOrders.addItem.path, async (req, res) => {
    try {
      const poId = Number(req.params.id);
      const input = insertPurchaseOrderItemSchema.parse(req.body);
      
      // Check for duplicate items
      const po = await storage.getPurchaseOrder(poId);
      if (po && po.items.some(item => item.itemId === input.itemId)) {
        return res.status(409).json({ message: "This item already exists in the purchase order" });
      }
      
      const item = await storage.addItemToPurchaseOrder(poId, input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        console.error("Error adding item:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(api.purchaseOrders.updateItem.path, async (req, res) => {
    try {
      const itemId = Number(req.params.itemId);
      const input = req.body;
      const item = await storage.updatePurchaseOrderItem(itemId, input);
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.purchaseOrders.deleteItem.path, async (req, res) => {
    try {
      const itemId = Number(req.params.itemId);
      await storage.deletePurchaseOrderItem(itemId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.purchaseOrderItems.updateStatus.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const item = await storage.updatePurchaseOrderItemStatus(id, status);
      res.json(item);
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ message: 'Item not found' });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(api.purchaseOrderItems.updateProcess.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { stageIndex, remarks, completed } = req.body;
      
      if (stageIndex === undefined) {
        return res.status(400).json({ message: 'Stage index is required' });
      }

      const item = await storage.updatePurchaseOrderItemProcess(id, stageIndex, remarks, completed);
      res.json(item);
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        res.status(404).json({ message: 'Item not found' });
      } else if (err instanceof Error && err.message.includes('Invalid stage index')) {
        res.status(400).json({ message: 'Invalid stage index' });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Process History routes
  app.get(api.purchaseOrderItems.getHistory.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const history = await storage.getProcessHistory(id);
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.processHistory.list.path, async (req, res) => {
    try {
      const history = await storage.getAllProcessHistory();
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
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
