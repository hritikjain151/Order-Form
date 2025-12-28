import { db } from "./db";
import {
  items,
  purchaseOrders,
  purchaseOrderItems,
  processHistory,
  type InsertItem,
  type InsertPurchaseOrder,
  type InsertPurchaseOrderItem,
  type Item,
  type PurchaseOrder,
  type PurchaseOrderWithItems,
  type ProcessHistoryEntry
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Items
  getItems(): Promise<Item[]>;
  getItemByMaterialNumber(materialNumber: string): Promise<Item | undefined>;
  getItemById(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: InsertItem): Promise<Item>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrderWithItems[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrderWithItems | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder, items: (InsertPurchaseOrderItem & { item: Item })[]): Promise<PurchaseOrderWithItems>;
  updatePurchaseOrderItemStatus(id: number, status: string): Promise<any>;
  updatePurchaseOrderItemProcess(id: number, stageIndex: number, remarks?: string, completed?: boolean): Promise<any>;
  
  // Process History
  getProcessHistory(poItemId: number): Promise<ProcessHistoryEntry[]>;
  getAllProcessHistory(): Promise<ProcessHistoryEntry[]>;
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

  async getItemById(id: number): Promise<Item | undefined> {
    const [result] = await db.select().from(items).where(eq(items.id, id));
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

  async updateItem(id: number, item: InsertItem): Promise<Item> {
    const existing = await this.getItemById(id);
    if (!existing) {
      throw new Error('Item not found');
    }
    
    // Check if material number is being changed and if the new one already exists
    if (item.materialNumber.toLowerCase() !== existing.materialNumber.toLowerCase()) {
      const duplicate = await this.getItemByMaterialNumber(item.materialNumber);
      if (duplicate) {
        throw new Error(`Material Number '${item.materialNumber}' already exists`);
      }
    }
    
    const [updated] = await db.update(items).set(item).where(eq(items.id, id)).returning();
    return updated;
  }

  // Purchase Orders
  private initializeProcesses(processesJson: string | null): string {
    const PROCESS_STAGES = [
      "Feasibility", "Designing", "Cutting", "Internal Quality", "Processing",
      "Fabrication", "Finishing", "Internal Quality", "Customer Quality", "Ready For Dispatch"
    ];
    
    if (!processesJson) {
      return JSON.stringify(PROCESS_STAGES.map(stage => ({ stage, remarks: "", completed: false })));
    }
    return processesJson;
  }

  async getPurchaseOrders(): Promise<PurchaseOrderWithItems[]> {
    const pos = await db.select().from(purchaseOrders);
    const result: PurchaseOrderWithItems[] = [];

    for (const po of pos) {
      const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
      const itemsWithDetails = await Promise.all(
        poItems.map(async (poItem) => {
          const [itemDetail] = await db.select().from(items).where(eq(items.id, poItem.itemId));
          return { ...poItem, item: itemDetail, processes: this.initializeProcesses(poItem.processes) };
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
        return { ...poItem, item: itemDetail, processes: this.initializeProcesses(poItem.processes) };
      })
    );
    return { ...po, items: itemsWithDetails };
  }

  async createPurchaseOrder(insertPo: InsertPurchaseOrder, itemsData: (InsertPurchaseOrderItem & { item: Item })[]): Promise<PurchaseOrderWithItems> {
    const PROCESS_STAGES = [
      "Feasibility", "Designing", "Cutting", "Internal Quality", "Processing",
      "Fabrication", "Finishing", "Internal Quality", "Customer Quality", "Ready For Dispatch"
    ];
    
    const [po] = await db.insert(purchaseOrders).values(insertPo).returning();
    
    if (itemsData.length > 0) {
      const poItems = itemsData.map(({ item, ...poItem }) => ({ 
        ...poItem, 
        poId: po.id,
        processes: JSON.stringify(PROCESS_STAGES.map(stage => ({ stage, remarks: "", completed: false })))
      }));
      await db.insert(purchaseOrderItems).values(poItems);
    }

    const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
    const itemsWithDetails = await Promise.all(
      poItems.map(async (poItem) => {
        const [itemDetail] = await db.select().from(items).where(eq(items.id, poItem.itemId));
        return { ...poItem, item: itemDetail, processes: this.initializeProcesses(poItem.processes) };
      })
    );
    return { ...po, items: itemsWithDetails };
  }

  async updatePurchaseOrderItemStatus(id: number, status: string): Promise<any> {
    const [item] = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    if (!item) throw new Error('Item not found');
    const [updated] = await db.update(purchaseOrderItems).set({ processes: this.initializeProcesses(item.processes) }).where(eq(purchaseOrderItems.id, id)).returning();
    return updated;
  }

  async updatePurchaseOrderItemProcess(id: number, stageIndex: number, remarks?: string, completed?: boolean): Promise<any> {
    const [item] = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
    if (!item) throw new Error('Item not found');
    
    const processes = JSON.parse(this.initializeProcesses(item.processes));
    if (stageIndex < 0 || stageIndex >= processes.length) {
      throw new Error('Invalid stage index');
    }
    
    const previousRemarks = processes[stageIndex].remarks || null;
    const previousCompleted = processes[stageIndex].completed;
    
    // Determine the action type
    let action = 'updated';
    if (completed !== undefined && completed !== previousCompleted) {
      action = completed ? 'completed' : 'uncompleted';
    } else if (remarks !== undefined && remarks !== previousRemarks) {
      action = previousRemarks ? 'remarks_updated' : 'remarks_added';
    }
    
    if (remarks !== undefined) processes[stageIndex].remarks = remarks;
    if (completed !== undefined) processes[stageIndex].completed = completed;
    
    const [updated] = await db.update(purchaseOrderItems).set({ processes: JSON.stringify(processes) }).where(eq(purchaseOrderItems.id, id)).returning();
    
    // Record history entry
    await db.insert(processHistory).values({
      poItemId: id,
      stageName: processes[stageIndex].stage,
      stageIndex,
      action,
      remarks: remarks || null,
      previousRemarks,
      completed: completed !== undefined ? (completed ? 1 : 0) : (previousCompleted ? 1 : 0),
      changedAt: new Date(),
    });
    
    return updated;
  }

  async updatePurchaseOrder(id: number, data: any): Promise<PurchaseOrderWithItems> {
    const [po] = await db.update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id)).returning();
    if (!po) throw new Error('Purchase Order not found');
    
    const poItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, id));
    const itemsWithDetails = await Promise.all(
      poItems.map(async (poItem) => {
        const [itemDetail] = await db.select().from(items).where(eq(items.id, poItem.itemId));
        return { ...poItem, item: itemDetail, processes: this.initializeProcesses(poItem.processes) };
      })
    );
    return { ...po, items: itemsWithDetails };
  }

  async addItemToPurchaseOrder(poId: number, itemData: any): Promise<any> {
    const PROCESS_STAGES = [
      "Feasibility", "Designing", "Cutting", "Internal Quality", "Processing",
      "Fabrication", "Finishing", "Internal Quality", "Customer Quality", "Ready For Dispatch"
    ];
    
    const [item] = await db.insert(purchaseOrderItems).values({
      poId,
      itemId: itemData.itemId,
      quantity: itemData.quantity,
      priceOverride: itemData.priceOverride || null,
      processes: JSON.stringify(PROCESS_STAGES.map(stage => ({ stage, remarks: "", completed: false })))
    }).returning();
    
    return item;
  }

  async updatePurchaseOrderItem(itemId: number, data: any): Promise<any> {
    const [updated] = await db.update(purchaseOrderItems).set(data).where(eq(purchaseOrderItems.id, itemId)).returning();
    return updated;
  }

  async deletePurchaseOrderItem(itemId: number): Promise<void> {
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, itemId));
  }
  
  // Process History methods
  async getProcessHistory(poItemId: number): Promise<ProcessHistoryEntry[]> {
    const history = await db.select().from(processHistory)
      .where(eq(processHistory.poItemId, poItemId))
      .orderBy(desc(processHistory.changedAt));
    return history as ProcessHistoryEntry[];
  }
  
  async getAllProcessHistory(): Promise<ProcessHistoryEntry[]> {
    const history = await db.select().from(processHistory)
      .orderBy(desc(processHistory.changedAt));
    return history as ProcessHistoryEntry[];
  }
}

export const storage = new DatabaseStorage();
