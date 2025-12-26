import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { format } from "date-fns";
import { Loader2, Package, Calendar, DollarSign, User } from "lucide-react";
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                  #{order.poNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">{order.vendorName}</h3>
              </div>
              <p className="text-slate-500 text-sm line-clamp-1">{order.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                {format(new Date(order.orderDate), "MMM dd, yyyy")}
              </div>
              
              <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                {order.requesterName}
              </div>

              <div className="flex items-center text-sm font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                <DollarSign className="w-4 h-4 mr-1" />
                {order.totalAmount.toLocaleString()}
              </div>

              <Badge status={order.status} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
  }[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles} capitalize`}>
      {status}
    </span>
  );
}
