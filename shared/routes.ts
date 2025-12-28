import { z } from 'zod';
import { insertItemSchema, insertPurchaseOrderSchema, insertPurchaseOrderItemSchema, createPurchaseOrderWithItemsSchema } from './schema';
export { createPurchaseOrderWithItemsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  items: {
    list: {
      method: 'GET' as const,
      path: '/api/items',
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/items',
      input: insertItemSchema,
      responses: {
        201: z.custom<any>(),
        400: errorSchemas.validation,
        409: errorSchemas.conflict,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/items/:id',
      input: insertItemSchema,
      responses: {
        200: z.custom<any>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  purchaseOrderItems: {
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/purchase-order-items/:id/status',
      input: z.object({
        status: z.string(),
      }),
      responses: {
        200: z.custom<any>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    updateProcess: {
      method: 'PATCH' as const,
      path: '/api/purchase-order-items/:id/process',
      input: z.object({
        stageIndex: z.number(),
        remarks: z.string().optional(),
        completed: z.boolean().optional(),
      }),
      responses: {
        200: z.custom<any>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
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
    update: {
      method: 'PATCH' as const,
      path: '/api/purchase-orders/:id',
      input: insertPurchaseOrderSchema,
      responses: {
        200: z.custom<any>(),
        400: errorSchemas.validation,
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
