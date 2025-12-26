import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull(),
  vendorName: text("vendor_name").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  totalAmount: integer("total_amount").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  requesterName: text("requester_name").notNull(),
  status: text("status").notNull().default('Pending'),
  deliveryDate: timestamp("delivery_date"),
  remarks: text("remarks"),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ 
  id: true 
}).extend({
  poNumber: z.string().regex(/^\d{12}$/, "PO Number must be exactly 12 digits"),
  totalAmount: z.coerce.number().min(0, "Amount must be positive"),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date().optional(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
