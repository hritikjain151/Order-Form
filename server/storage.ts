import { db } from "./db";
import {
  purchaseOrders,
  type InsertPurchaseOrder,
  type PurchaseOrder
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
}

export class DatabaseStorage implements IStorage {
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders);
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return po;
  }

  async createPurchaseOrder(insertPo: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [po] = await db.insert(purchaseOrders).values(insertPo).returning();
    return po;
  }
}

export const storage = new DatabaseStorage();
