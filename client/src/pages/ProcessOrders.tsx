import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useUpdateItemStatus } from "@/hooks/use-purchase-orders";
import { STATUS_OPTIONS } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ProcessOrdersPage() {
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const updateStatusMutation = useUpdateItemStatus();

  const getStatusIndex = (status: string) => {
    return STATUS_OPTIONS.indexOf(status as any);
  };

  const getProgressPercentage = (status: string) => {
    const index = getStatusIndex(status);
    return ((index + 1) / STATUS_OPTIONS.length) * 100;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Pending": "text-slate-600",
      "Processing": "text-blue-600",
      "Shipped": "text-purple-600",
      "Delivered": "text-green-600",
    };
    return colors[status] || "text-slate-600";
  };

  const getProgressColor = (status: string) => {
    const colors: Record<string, string> = {
      "Pending": "bg-slate-300",
      "Processing": "bg-blue-400",
      "Shipped": "bg-purple-400",
      "Delivered": "bg-green-400",
    };
    return colors[status] || "bg-slate-300";
  };

  const handleStatusChange = (itemId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: itemId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Process Orders</h1>
          <p className="text-sm text-slate-600 mt-2">Track and manage the status of your active purchase orders</p>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-slate-600 text-sm">No purchase orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden">
                {/* PO Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">PO Number</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{po.poNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Vendor</p>
                      <p className="text-sm text-slate-900 mt-1">{po.vendorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Order Date</p>
                      <p className="text-sm text-slate-900 mt-1">{format(new Date(po.orderDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Delivery Date</p>
                      <p className="text-sm text-slate-900 mt-1">
                        {po.deliveryDate ? format(new Date(po.deliveryDate), "MMM dd, yyyy") : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.items.map((poItem) => (
                        <tr key={poItem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">
                            {poItem.item.materialNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{poItem.item.itemName}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">{poItem.quantity}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                            ${poItem.priceOverride || poItem.item.price}
                          </td>
                          <td className="px-6 py-4">
                            <Select
                              value={poItem.status || "Pending"}
                              onValueChange={(newStatus) => handleStatusChange(poItem.id, newStatus)}
                            >
                              <SelectTrigger className="w-40 h-9 text-sm rounded-lg border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status} className="text-sm">
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-40">
                                <Progress
                                  value={getProgressPercentage(poItem.status || "Pending")}
                                  className="h-2 rounded-full bg-slate-200"
                                />
                                <p className={`text-xs font-semibold mt-1.5 ${getStatusColor(poItem.status || "Pending")}`}>
                                  {poItem.status || "Pending"}
                                </p>
                              </div>
                              {poItem.status === "Delivered" && (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PO Footer */}
                {po.remarks && (
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
                    <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Remarks</p>
                    <p className="text-sm text-slate-700 mt-1">{po.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
