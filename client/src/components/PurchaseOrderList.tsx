import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { format } from "date-fns";
import { Loader2, Package, Calendar, DollarSign } from "lucide-react";
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
    <div className="space-y-6">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-primary/20 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          {/* PO Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold bg-white text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                  {order.poNumber}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{order.vendorName}</h3>
                  <p className="text-xs text-slate-500">{format(new Date(order.orderDate), "MMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{order.items?.length || 0} items</p>
                {order.deliveryDate && (
                  <p className="text-xs text-slate-500">Est. {format(new Date(order.deliveryDate), "MMM dd")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="divide-y divide-slate-100">
            {order.items?.map((item, itemIdx) => (
              <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.partName}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Mat: <span className="font-mono">{item.materialNumber}</span> | 
                        Dwg: <span className="font-mono">{item.drawingNumber}</span>
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-bold text-slate-900">${item.price}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  {item.importantRemarks && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-700">
                      <span className="font-semibold">⚠ {item.importantRemarks}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {order.remarks && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-sm text-slate-700"><span className="font-semibold">Notes:</span> {order.remarks}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
