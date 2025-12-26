import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
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

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull(),
  vendorName: text("vendor_name").notNull(),
  orderDate: timestamp("order_date").notNull(),
  materialNumber: text("material_number").notNull(),
  drawingNumber: text("drawing_number").notNull(),
  partName: text("part_name").notNull(),
  description: text("description").notNull(),
  importantRemarks: text("important_remarks"),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  deliveryDate: timestamp("delivery_date"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ 
  id: true,
  createdAt: true
}).extend({
  poNumber: z.string().min(1, "PO Number is required"),
  vendorName: z.enum(VENDOR_OPTIONS),
  materialNumber: z.string().min(1, "Material Number is required"),
  drawingNumber: z.string().min(1, "Drawing Number is required"),
  partName: z.string().min(1, "Part Name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be positive"),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
