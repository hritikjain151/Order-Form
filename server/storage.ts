import { db } from "./db";
import {
  purchaseOrders,
  purchaseOrderItems,
  type InsertPurchaseOrder,
  type InsertPurchaseOrderItem,
  type PurchaseOrder,
  type PurchaseOrderItem,
  type PurchaseOrderWithItems
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPurchaseOrders(): Promise<PurchaseOrderWithItems[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrderWithItems>;
}

export class DatabaseStorage implements IStorage {
  async getPurchaseOrders(): Promise<PurchaseOrderWithItems[]> {
    const pos = await db.select().from(purchaseOrders);
    const result: PurchaseOrderWithItems[] = [];

    for (const po of pos) {
      const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
      result.push({ ...po, items });
    }

    return result;
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    if (!po) return undefined;

    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, id));
    return { ...po, items };
  }

  async createPurchaseOrder(insertPo: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrderWithItems> {
    const [po] = await db.insert(purchaseOrders).values(insertPo).returning();
    
    if (items.length > 0) {
      const itemsWithPoId = items.map(item => ({ ...item, poId: po.id }));
      await db.insert(purchaseOrderItems).values(itemsWithPoId);
    }

    const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
    return { ...po, items: poItems };
  }
}

export const storage = new DatabaseStorage();
