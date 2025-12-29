import { usePurchaseOrders, useUpdateProcessStage } from "@/hooks/use-purchase-orders";
import { PROCESS_STAGES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface EditingProcess {
  itemId: number;
  stageIndex: number;
  currentRemarks: string;
  isCompleted: boolean;
}

export default function ProcessOrdersPage() {
  const { data: allPurchaseOrders = [], isLoading } = usePurchaseOrders();
  const updateProcessStageMutation = useUpdateProcessStage();
  const [editingProcess, setEditingProcess] = useState<EditingProcess | null>(null);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<"under-process" | "completed">("under-process");

  const getCompletedCount = (processes: any[]) => {
    return processes.filter(p => p.completed).length;
  };

  const getCurrentStageIndex = (processes: any[]) => {
    return processes.findIndex(p => !p.completed);
  };

  const getProgressPercentage = (processes: any[]) => {
    const count = getCompletedCount(processes);
    return (count / processes.length) * 100;
  };

  const isItemCompleted = (processes: any[]) => {
    return processes.every(p => p.completed);
  };

  // Filter out POs where all items are completed
  const purchaseOrders = allPurchaseOrders.filter((po: any) => {
    return po.items.some((item: any) => {
      const processes = JSON.parse(item.processes || "[]");
      return !isItemCompleted(processes);
    });
  });

  const handleOpenProcessDialog = (itemId: number, stageIndex: number, currentRemarks: string, isCompleted: boolean) => {
    setEditingProcess({ itemId, stageIndex, currentRemarks, isCompleted });
    setRemarks(currentRemarks);
    setStatus(isCompleted ? "completed" : "under-process");
  };

  const handleSaveProcess = () => {
    if (editingProcess) {
      const isCompleted = status === "completed";
      updateProcessStageMutation.mutate({
        id: editingProcess.itemId,
        stageIndex: editingProcess.stageIndex,
        remarks,
        completed: isCompleted,
      }, {
        onSuccess: () => {
          setEditingProcess(null);
          setRemarks("");
          setStatus("under-process");
        }
      });
    }
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Process Orders</h1>
          <p className="text-sm text-slate-600 mt-2">Track and manage the detailed processing stages for your purchase order items</p>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-sm">No purchase orders found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {/* PO Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">PO Number</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{po.poNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Vendor</p>
                      <p className="text-sm text-slate-700 mt-1">{po.vendorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Order Date</p>
                      <p className="text-sm text-slate-700 mt-1">{format(new Date(po.orderDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Delivery Date</p>
                      <p className="text-sm text-slate-700 mt-1">
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
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Item Name</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Material #</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Quantity</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Unit Price</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Delivery Date</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {po.items
                        .filter((poItem) => {
                          const processes = JSON.parse(poItem.processes || "[]");
                          return !isItemCompleted(processes);
                        })
                        .map((poItem) => {
                        const processes = JSON.parse(poItem.processes || "[]");
                        const completedCount = getCompletedCount(processes);
                        const progressPercentage = getProgressPercentage(processes);
                        const currentStageIndex = getCurrentStageIndex(processes);
                        const currentStage = currentStageIndex >= 0 ? processes[currentStageIndex] : null;
                        const unitPrice = poItem.priceOverride ? parseFloat(poItem.priceOverride) : parseFloat(poItem.item.price);

                        return (
                          <tr key={poItem.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{poItem.item.itemName}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{poItem.item.materialNumber}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{poItem.quantity}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">${unitPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{po.deliveryDate ? format(new Date(po.deliveryDate), "MMM dd, yyyy") : "N/A"}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-start gap-3 min-w-96">
                                {/* Current Process Status */}
                                {currentStage && (
                                  <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-slate-900">{PROCESS_STAGES[currentStageIndex]}</span>
                                      <span className="text-xs text-slate-500">(Current)</span>
                                    </div>
                                    {currentStage.remarks && (
                                      <p className="text-xs text-slate-600 italic">"{currentStage.remarks}"</p>
                                    )}
                                  </div>
                                )}
                                
                                {/* Progress Bar */}
                                <div className="w-full">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-600">Process Progress</span>
                                    <span className="text-xs font-semibold text-slate-900">{completedCount}/{PROCESS_STAGES.length}</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                                      style={{ width: `${progressPercentage}%` }}
                                    />
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => currentStageIndex >= 0 && handleOpenProcessDialog(poItem.id, currentStageIndex, currentStage?.remarks || "", false)}
                                  disabled={currentStageIndex < 0}
                                  data-testid={`button-process-${poItem.id}`}
                                >
                                  Update Process
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Modal */}
      <Dialog open={!!editingProcess} onOpenChange={(open) => !open && setEditingProcess(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Process Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingProcess && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {PROCESS_STAGES[editingProcess.stageIndex]}
                </p>
                <p className="text-xs text-slate-600">
                  Mark this stage as complete or under process
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">Remarks</label>
              <Textarea
                placeholder="Add remarks for this stage..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-24 text-sm resize-none"
                data-testid="input-process-remarks"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">Status</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setStatus("under-process")}
                >
                  <input
                    type="radio"
                    id="under-process"
                    name="status"
                    value="under-process"
                    checked={status === "under-process"}
                    onChange={() => setStatus("under-process")}
                    className="w-4 h-4"
                    data-testid="radio-under-process"
                  />
                  <label htmlFor="under-process" className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                    Under Process
                  </label>
                  <span className="text-xs text-slate-500">No progress</span>
                </div>

                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setStatus("completed")}
                >
                  <input
                    type="radio"
                    id="completed"
                    name="status"
                    value="completed"
                    checked={status === "completed"}
                    onChange={() => setStatus("completed")}
                    className="w-4 h-4"
                    data-testid="radio-completed"
                  />
                  <label htmlFor="completed" className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                    Completed
                  </label>
                  <span className="text-xs text-emerald-600 font-medium">Mark done</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingProcess(null)}
                className="flex-1"
                data-testid="button-cancel-process"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProcess}
                disabled={updateProcessStageMutation.isPending}
                className="flex-1"
                data-testid="button-save-process"
              >
                {updateProcessStageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
