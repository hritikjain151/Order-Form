import { db } from "./db";
import {
  items,
  purchaseOrders,
  purchaseOrderItems,
  type InsertItem,
  type InsertPurchaseOrder,
  type InsertPurchaseOrderItem,
  type Item,
  type PurchaseOrder,
  type PurchaseOrderWithItems
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Items
  getItems(): Promise<Item[]>;
  getItemByMaterialNumber(materialNumber: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrderWithItems[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder, items: (InsertPurchaseOrderItem & { item: Item })[]): Promise<PurchaseOrderWithItems>;
}

export class DatabaseStorage implements IStorage {
  // Items
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getItemByMaterialNumber(materialNumber: string): Promise<Item | undefined> {
    const [result] = await db.select().from(items).where(eq(items.materialNumber, materialNumber));
    return result;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const existing = await this.getItemByMaterialNumber(item.materialNumber);
    if (existing) {
      throw new Error(`Material Number '${item.materialNumber}' already exists`);
    }
    const [created] = await db.insert(items).values(item).returning();
    return created;
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrderWithItems[]> {
    const pos = await db.select().from(purchaseOrders);
    const result: PurchaseOrderWithItems[] = [];

    for (const po of pos) {
      const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
      const itemsWithDetails = await Promise.all(
        poItems.map(async (poItem) => {
          const [itemDetail] = await db.select().from(items).where(eq(items.id, poItem.itemId));
          return { ...poItem, item: itemDetail };
        })
      );
      result.push({ ...po, items: itemsWithDetails });
    }

    return result;
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    if (!po) return undefined;

    const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, id));
    const itemsWithDetails = await Promise.all(
      poItems.map(async (poItem) => {
        const [itemDetail] = await db.select().from(items).where(eq(items.id, poItem.itemId));
        return { ...poItem, item: itemDetail };
      })
    );
    return { ...po, items: itemsWithDetails };
  }

  async createPurchaseOrder(insertPo: InsertPurchaseOrder, itemsData: (InsertPurchaseOrderItem & { item: Item })[]): Promise<PurchaseOrderWithItems> {
    const [po] = await db.insert(purchaseOrders).values(insertPo).returning();
    
    if (itemsData.length > 0) {
      const poItems = itemsData.map(({ item, ...poItem }) => ({ 
        ...poItem, 
        poId: po.id 
      }));
      await db.insert(purchaseOrderItems).values(poItems);
    }

    const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
    const itemsWithDetails = await Promise.all(
      poItems.map(async (poItem) => {
        const [itemDetail] = await db.select().from(items).where(eq(items.id, poItem.itemId));
        return { ...poItem, item: itemDetail };
      })
    );
    return { ...po, items: itemsWithDetails };
  }
}

export const storage = new DatabaseStorage();
