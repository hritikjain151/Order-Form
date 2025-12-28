import { useState } from "react";
import { usePurchaseOrders, useAllProcessHistory } from "@/hooks/use-purchase-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  ClipboardList, 
  Package, 
  CheckCircle2, 
  Clock, 
  History, 
  ChevronRight,
  Calendar,
  MessageSquare,
  RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
import type { ProcessHistoryEntry, PurchaseOrderWithItems } from "@shared/schema";

interface ProcessStage {
  stage: string;
  remarks: string;
  completed: boolean;
}

export default function DetailedOrderStatus() {
  const { data: purchaseOrders, isLoading: posLoading } = usePurchaseOrders();
  const { data: allHistory, isLoading: historyLoading, refetch: refetchHistory } = useAllProcessHistory();
  const [selectedPoItemId, setSelectedPoItemId] = useState<number | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const getItemHistory = (poItemId: number) => {
    if (!allHistory) return [];
    return allHistory.filter((h: ProcessHistoryEntry) => h.poItemId === poItemId);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600 text-white" data-testid="badge-action-completed">Completed</Badge>;
      case 'uncompleted':
        return <Badge variant="secondary" data-testid="badge-action-uncompleted">Uncompleted</Badge>;
      case 'remarks_added':
        return <Badge variant="outline" className="border-blue-500 text-blue-600" data-testid="badge-action-remarks-added">Remarks Added</Badge>;
      case 'remarks_updated':
        return <Badge variant="outline" className="border-amber-500 text-amber-600" data-testid="badge-action-remarks-updated">Remarks Updated</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-action-default">Updated</Badge>;
    }
  };

  const calculateProgress = (processes: ProcessStage[]) => {
    const completed = processes.filter(p => p.completed).length;
    return Math.round((completed / processes.length) * 100);
  };

  const openHistoryDialog = (poItemId: number) => {
    setSelectedPoItemId(poItemId);
    setHistoryDialogOpen(true);
  };

  if (posLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="page-title">
            <ClipboardList className="w-6 h-6" />
            Detailed Order Status
          </h1>
          <p className="text-muted-foreground mt-1">
            View comprehensive status of all purchase orders with process history
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetchHistory()}
          data-testid="button-refresh-history"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {purchaseOrders && purchaseOrders.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {purchaseOrders.map((po: PurchaseOrderWithItems) => (
            <AccordionItem 
              key={po.id} 
              value={`po-${po.id}`}
              className="border rounded-lg bg-card"
              data-testid={`accordion-po-${po.id}`}
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold" data-testid={`text-po-number-${po.id}`}>{po.poNumber}</p>
                      <p className="text-sm text-muted-foreground">{po.vendorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">{format(new Date(po.orderDate), "MMM dd, yyyy")}</p>
                    </div>
                    <Badge variant="outline" data-testid={`badge-item-count-${po.id}`}>
                      {po.items.length} items
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-2">
                  {po.items.map((poItem, itemIndex) => {
                    const processes: ProcessStage[] = JSON.parse(poItem.processes || '[]');
                    const progress = calculateProgress(processes);
                    const itemHistory = getItemHistory(poItem.id);
                    
                    return (
                      <Card key={poItem.id} className="border-l-4 border-l-primary/50" data-testid={`card-item-${poItem.id}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2" data-testid={`text-item-name-${poItem.id}`}>
                                {poItem.item?.itemName}
                                <Badge variant="secondary" size="sm">
                                  {poItem.item?.materialNumber}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                Quantity: {poItem.quantity} | 
                                Price: ${poItem.priceOverride || poItem.item?.price}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Progress</p>
                                <p className="text-lg font-bold text-primary" data-testid={`text-progress-${poItem.id}`}>
                                  {progress}%
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openHistoryDialog(poItem.id)}
                                data-testid={`button-view-history-${poItem.id}`}
                              >
                                <History className="w-4 h-4 mr-1" />
                                History ({itemHistory.length})
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                            <div className="space-y-3 pl-10">
                              {processes.map((process, idx) => (
                                <div 
                                  key={idx} 
                                  className={`relative flex items-start gap-3 ${process.completed ? 'opacity-100' : 'opacity-60'}`}
                                  data-testid={`process-stage-${poItem.id}-${idx}`}
                                >
                                  <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    ${process.completed 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'bg-background border-slate-300'}`}
                                  >
                                    {process.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`font-medium text-sm ${process.completed ? 'text-green-700' : 'text-muted-foreground'}`}>
                                        {process.stage}
                                      </p>
                                      {process.completed ? (
                                        <Badge variant="default" size="sm" className="bg-green-600">Complete</Badge>
                                      ) : (
                                        <Badge variant="outline" size="sm">Pending</Badge>
                                      )}
                                    </div>
                                    {process.remarks && (
                                      <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground bg-slate-50 rounded p-2">
                                        <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{process.remarks}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="text-center py-12" data-testid="empty-state">
          <CardContent>
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Purchase Orders</h3>
            <p className="text-muted-foreground">Create purchase orders to see their detailed status here.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Process History
            </DialogTitle>
          </DialogHeader>
          
          {selectedPoItemId && (
            <div className="mt-4">
              {getItemHistory(selectedPoItemId).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getItemHistory(selectedPoItemId).map((entry: ProcessHistoryEntry) => (
                      <TableRow key={entry.id} data-testid={`history-row-${entry.id}`}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{format(new Date(entry.changedAt), "MMM dd, yyyy")}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(entry.changedAt), "hh:mm:ss a")}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.stageName}</Badge>
                        </TableCell>
                        <TableCell>{getActionBadge(entry.action)}</TableCell>
                        <TableCell>
                          {entry.remarks ? (
                            <div className="max-w-xs">
                              <p className="text-sm truncate">{entry.remarks}</p>
                              {entry.previousRemarks && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Previous: {entry.previousRemarks}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8" data-testid="no-history-state">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No history recorded for this item yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    History will appear when you update process stages.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
