import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPurchaseOrder, type InsertItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useItems() {
  return useQuery({
    queryKey: [api.items.list.path],
    queryFn: async () => {
      const res = await fetch(api.items.list.path);
      if (!res.ok) throw new Error("Failed to fetch items");
      return api.items.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertItem) => {
      const res = await fetch(api.items.create.path, {
        method: api.items.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const error = await res.json();
          throw new Error(error.message || "Material Number already exists");
        }
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create item");
      }
      
      return api.items.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      toast({
        title: "Success",
        description: "Item created successfully",
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

export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertItem }) => {
      const res = await fetch(api.items.update.path.replace(':id', String(id)), {
        method: api.items.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const error = await res.json();
          throw new Error(error.message || "Material Number already exists");
        }
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        if (res.status === 404) {
          const error = await res.json();
          throw new Error(error.message || "Item not found");
        }
        throw new Error("Failed to update item");
      }
      
      return api.items.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      toast({
        title: "Success",
        description: "Item updated successfully",
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
    mutationFn: async (data: any) => {
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

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(api.purchaseOrderItems.updateStatus.path.replace(':id', String(id)), {
        method: api.purchaseOrderItems.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          const error = await res.json();
          throw new Error(error.message || "Item not found");
        }
        throw new Error("Failed to update item status");
      }

      return api.purchaseOrderItems.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.purchaseOrders.list.path] });
      toast({
        title: "Success",
        description: "Status updated successfully",
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

export function useUpdateProcessStage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, stageIndex, remarks, completed }: { id: number; stageIndex: number; remarks?: string; completed?: boolean }) => {
      const res = await fetch(api.purchaseOrderItems.updateProcess.path.replace(':id', String(id)), {
        method: api.purchaseOrderItems.updateProcess.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageIndex, remarks, completed }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          const error = await res.json();
          throw new Error(error.message || "Item not found");
        }
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid request");
        }
        throw new Error("Failed to update process stage");
      }

      return api.purchaseOrderItems.updateProcess.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.purchaseOrders.list.path] });
      toast({
        title: "Success",
        description: "Process stage updated successfully",
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

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertPurchaseOrder }) => {
      const res = await fetch(api.purchaseOrders.update.path.replace(':id', String(id)), {
        method: api.purchaseOrders.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        if (res.status === 404) {
          const error = await res.json();
          throw new Error(error.message || "Purchase Order not found");
        }
        throw new Error("Failed to update purchase order");
      }

      return api.purchaseOrders.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.purchaseOrders.list.path] });
      toast({
        title: "Success",
        description: "Purchase Order updated successfully",
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
