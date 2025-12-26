import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { Loader2, Package } from "lucide-react";
import { motion } from "framer-motion";

export function PurchaseOrderList() {
  const { data: orders, isLoading, error } = usePurchaseOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20 text-sm">
        <p className="font-semibold">Error loading orders</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
        <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-900">No Orders Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          Create your first purchase order using the form.
        </p>
      </div>
    );
  }

  // Sort by PO number ascending
  const sortedOrders = [...orders].sort((a, b) => 
    a.poNumber.localeCompare(b.poNumber)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/30">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900">Purchase Orders</h3>
      </div>
      
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {sortedOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {order.poNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {order.vendorName}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
