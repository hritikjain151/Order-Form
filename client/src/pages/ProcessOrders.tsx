import { usePurchaseOrders, useUpdateProcessStage } from "@/hooks/use-purchase-orders";
import { PROCESS_STAGES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface EditingStage {
  itemId: number;
  stageIndex: number;
}

export default function ProcessOrdersPage() {
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const updateProcessStageMutation = useUpdateProcessStage();
  const [editingStage, setEditingStage] = useState<EditingStage | null>(null);
  const [remarks, setRemarks] = useState("");
  const [completed, setCompleted] = useState(false);

  const getCompletedCount = (processes: any[]) => {
    return processes.filter(p => p.completed).length;
  };

  const getProgressPercentage = (processes: any[]) => {
    const count = getCompletedCount(processes);
    return (count / processes.length) * 100;
  };

  const handleOpenEdit = (itemId: number, stageIndex: number, currentRemarks: string, isCompleted: boolean) => {
    setEditingStage({ itemId, stageIndex });
    setRemarks(currentRemarks);
    setCompleted(isCompleted);
  };

  const handleSaveStage = () => {
    if (editingStage) {
      updateProcessStageMutation.mutate({
        id: editingStage.itemId,
        stageIndex: editingStage.stageIndex,
        remarks,
        completed,
      });
      setEditingStage(null);
      setRemarks("");
      setCompleted(false);
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

                {/* Items */}
                <div className="divide-y divide-slate-200">
                  {po.items.map((poItem) => {
                    const processes = JSON.parse(poItem.processes || "[]");
                    const completedCount = getCompletedCount(processes);
                    const progressPercentage = getProgressPercentage(processes);

                    return (
                      <div key={poItem.id} className="p-6">
                        {/* Item Header */}
                        <div className="mb-6">
                          <div className="flex items-baseline gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{poItem.item.itemName}</p>
                              <p className="text-xs text-slate-600 mt-1">Material: {poItem.item.materialNumber}</p>
                            </div>
                            <div className="text-xs text-slate-600 ml-auto">
                              <span className="font-semibold text-slate-900">{completedCount}/{processes.length}</span> stages completed
                            </div>
                          </div>
                          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Process Stages */}
                        <div className="space-y-3">
                          {processes.map((process: any, idx: number) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-4 p-4 rounded-md border transition-colors ${
                                process.completed
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {/* Stage Indicator */}
                              <div className="flex-shrink-0 mt-0.5">
                                {process.completed ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                                    {idx + 1}
                                  </div>
                                )}
                              </div>

                              {/* Stage Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`font-semibold ${process.completed ? "text-emerald-700" : "text-slate-900"}`}>
                                    {PROCESS_STAGES[idx]}
                                  </p>
                                  {process.completed && <span className="text-xs font-medium text-emerald-700">Completed</span>}
                                </div>
                                {process.remarks && (
                                  <p className="text-sm text-slate-600 mt-1 break-words">{process.remarks}</p>
                                )}
                              </div>

                              {/* Edit Button */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="flex-shrink-0"
                                onClick={() => handleOpenEdit(poItem.id, idx, process.remarks || "", process.completed)}
                                data-testid={`button-edit-process-${poItem.id}-${idx}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingStage} onOpenChange={(open) => !open && setEditingStage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Process Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">
                {editingStage && PROCESS_STAGES[editingStage.stageIndex]}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Remarks</label>
              <Textarea
                placeholder="Add remarks for this stage..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-24 text-sm resize-none"
                data-testid="input-process-remarks"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="completed"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
                data-testid="checkbox-process-completed"
              />
              <label htmlFor="completed" className="text-sm font-medium text-slate-700 cursor-pointer">
                Mark as completed
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingStage(null)}
                className="flex-1"
                data-testid="button-cancel-process"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStage}
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
