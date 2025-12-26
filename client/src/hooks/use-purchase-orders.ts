import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPurchaseOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function usePurchaseOrders() {
  return useQuery({
    queryKey: [api.purchaseOrders.list.path],
    queryFn: async () => {
      const res = await fetch(api.purchaseOrders.list.path);
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      return api.purchaseOrders.list.responses[200].parse(await res.json());
    },
  });
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: [api.purchaseOrders.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      const url = buildUrl(api.purchaseOrders.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch purchase order");
      return api.purchaseOrders.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPurchaseOrder) => {
      const res = await fetch(api.purchaseOrders.create.path, {
        method: api.purchaseOrders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create purchase order");
      }
      
      return api.purchaseOrders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.purchaseOrders.list.path] });
      toast({
        title: "Success",
        description: "Purchase Order created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
