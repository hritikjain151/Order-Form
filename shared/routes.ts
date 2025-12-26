import { z } from 'zod';
import { insertPurchaseOrderSchema, insertPurchaseOrderItemSchema, purchaseOrders, purchaseOrderItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Create PO with items in one request
export const createPurchaseOrderWithItemsSchema = insertPurchaseOrderSchema.extend({
  items: z.array(insertPurchaseOrderItemSchema).min(1, "At least one item is required"),
});

export const api = {
  purchaseOrders: {
    list: {
      method: 'GET' as const,
      path: '/api/purchase-orders',
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/purchase-orders',
      input: createPurchaseOrderWithItemsSchema,
      responses: {
        201: z.custom<any>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/purchase-orders/:id',
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
