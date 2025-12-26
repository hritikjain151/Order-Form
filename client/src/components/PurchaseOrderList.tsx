import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { format } from "date-fns";
import { Loader2, Package, Calendar, DollarSign, Package2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export function PurchaseOrderList() {
  const { data: orders, isLoading, error } = usePurchaseOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20">
        <p className="font-semibold">Error loading orders</p>
        <p className="text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">No Orders Yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          Create your first purchase order using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <div className="space-y-3">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                  {order.poNumber}
                </span>
                <h3 className="font-bold text-slate-900">{order.vendorName}</h3>
              </div>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                ${order.price.toLocaleString()} x {order.quantity}
              </span>
            </div>

            {/* Part Details */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Part:</span> {order.partName}</p>
              <p className="text-xs text-slate-500 mt-1">Mat: {order.materialNumber} | Dwg: {order.drawingNumber}</p>
            </div>

            {/* Description & Remarks */}
            <div className="text-sm text-slate-600 line-clamp-2">{order.description}</div>
            {order.importantRemarks && (
              <div className="text-xs bg-amber-50 border border-amber-100 text-amber-700 p-2 rounded-lg">
                <span className="font-semibold">⚠ {order.importantRemarks}</span>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center text-slate-600 bg-slate-50 px-2 py-1 rounded">
                <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                {format(new Date(order.orderDate), "MMM dd")}
              </div>
              {order.deliveryDate && (
                <div className="flex items-center text-slate-600 bg-slate-50 px-2 py-1 rounded">
                  <Package2 className="w-3 h-3 mr-1 text-slate-400" />
                  {format(new Date(order.deliveryDate), "MMM dd")}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
