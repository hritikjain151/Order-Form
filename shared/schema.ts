import { pgTable, text, serial, integer, timestamp, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const VENDOR_OPTIONS = [
  "RUBBER METSO",
  "SCREEN DEVELOPEMENT METSO",
  "SCREEN REGULAR METSO",
  "SOURCING METSO",
  "LT METSO",
  "AGGREGATE METSO",
  "OTHER"
] as const;

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  materialNumber: text("material_number").notNull().unique(),
  vendorName: text("vendor_name").notNull(),
  drawingNumber: text("drawing_number").notNull(),
  itemName: text("item_name").notNull(),
  description: text("description").notNull(),
  specialRemarks: text("special_remarks"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  weight: decimal("weight", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull(),
  department: text("department").notNull(),
  vendorName: text("vendor_name").notNull(),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  itemId: integer("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull(),
  priceOverride: decimal("price_override", { precision: 12, scale: 2 }),
});

export const insertItemSchema = createInsertSchema(items).omit({ 
  id: true,
  createdAt: true
}).extend({
  materialNumber: z.string().min(1, "Material Number is required"),
  vendorName: z.enum(VENDOR_OPTIONS),
  drawingNumber: z.string().min(1, "Drawing Number is required"),
  itemName: z.string().min(1, "Item Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  weight: z.coerce.number().optional(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ 
  id: true,
  createdAt: true
}).extend({
  poNumber: z.string().min(1, "PO Number is required"),
  department: z.string().min(1, "Department is required"),
  vendorName: z.enum(VENDOR_OPTIONS),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional(),
});

export const insertPurchaseOrderItemSchema = z.object({
  itemId: z.number().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  priceOverride: z.coerce.number().optional(),
});

export const createPurchaseOrderWithItemsSchema = insertPurchaseOrderSchema.extend({
  items: z.array(insertPurchaseOrderItemSchema).min(1, "At least one item is required"),
});

export type Item = typeof items.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: (PurchaseOrderItem & { item: Item })[];
}
