import { pgTable, text, serial, integer, timestamp, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const VENDOR_OPTIONS = [
  "RUBBER METSO",
  "SCREEN DEVELOPMENT METSO",
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
  revisionNumber: text("revision_number").notNull().default("1.0"),
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
  vendorName: text("vendor_name").notNull(),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const PROCESS_STAGES = [
  "Feasibility",
  "Designing",
  "Cutting",
  "Internal Quality",
  "Processing",
  "Fabrication",
  "Finishing",
  "Internal Quality",
  "Customer Quality",
  "Ready For Dispatch"
] as const;

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  itemId: integer("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull(),
  priceOverride: decimal("price_override", { precision: 12, scale: 2 }),
  processes: text("processes"),
});

// Available pages for access control
export const PAGE_OPTIONS = [
  "dashboard",
  "user-management",
  "add-items",
  "items-list",
  "add-purchase-orders",
  "order-processing",
  "detailed-order-status",
  "user-log-details"
] as const;

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isActive: integer("is_active").notNull().default(1),
  allowedPages: text("allowed_pages").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User activity logs table
export const userLogs = pgTable("user_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Process history table to track all status changes with timestamps
export const processHistory = pgTable("process_history", {
  id: serial("id").primaryKey(),
  poItemId: integer("po_item_id").notNull().references(() => purchaseOrderItems.id, { onDelete: "cascade" }),
  stageName: text("stage_name").notNull(),
  stageIndex: integer("stage_index").notNull(),
  action: text("action").notNull(), // 'completed', 'uncompleted', 'remarks_added', 'remarks_updated'
  remarks: text("remarks"),
  previousRemarks: text("previous_remarks"),
  completed: integer("completed").notNull(), // 1 = true, 0 = false
  changedAt: timestamp("changed_at").notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(items).omit({ 
  id: true,
  createdAt: true
}).extend({
  materialNumber: z.string().min(1, "Material Number is required"),
  vendorName: z.enum(VENDOR_OPTIONS),
  drawingNumber: z.string().min(1, "Drawing Number is required"),
  revisionNumber: z.string().min(1, "Revision Number is required"),
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
  vendorName: z.enum(VENDOR_OPTIONS),
  orderDate: z.coerce.date().min(new Date("2000-01-01"), "Order Date is required"),
  deliveryDate: z.coerce.date().min(new Date("2000-01-01"), "Delivery Date is required"),
  remarks: z.string().optional(),
});

export const insertPurchaseOrderItemSchema = z.object({
  itemId: z.number().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  priceOverride: z.coerce.number().optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true
}).extend({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  isActive: z.coerce.number().optional().default(1),
  allowedPages: z.array(z.string()).optional().default([]),
});

export const insertUserLogSchema = createInsertSchema(userLogs).omit({ 
  id: true,
  createdAt: true
}).extend({
  userId: z.number().min(1, "User ID is required"),
  action: z.string().min(1, "Action is required"),
  details: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const createPurchaseOrderWithItemsSchema = insertPurchaseOrderSchema.extend({
  items: z.array(insertPurchaseOrderItemSchema).min(1, "At least one item is required"),
});

export type Item = typeof items.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type ProcessHistory = typeof processHistory.$inferSelect;
export type User = typeof users.$inferSelect;
export type UserLog = typeof userLogs.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserLog = z.infer<typeof insertUserLogSchema>;

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: (PurchaseOrderItem & { item: Item })[];
}

export interface ProcessHistoryEntry {
  id: number;
  poItemId: number;
  stageName: string;
  stageIndex: number;
  action: string;
  remarks: string | null;
  previousRemarks: string | null;
  completed: number;
  changedAt: Date;
}
