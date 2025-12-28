import { useState, useMemo } from "react";
import { usePurchaseOrders, useAllProcessHistory } from "@/hooks/use-purchase-orders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ClipboardList, 
  Package, 
  CheckCircle2, 
  Clock, 
  History, 
  Calendar,
  RefreshCcw,
  Search,
  X
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
  const { data: allHistory, refetch: refetchHistory } = useAllProcessHistory();
  const [selectedPoItemId, setSelectedPoItemId] = useState<number | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPurchaseOrders = useMemo(() => {
    if (!purchaseOrders) return [];
    if (!searchQuery.trim()) return purchaseOrders;
    
    const query = searchQuery.toLowerCase();
    
    return purchaseOrders
      .map((po: PurchaseOrderWithItems) => {
        const poMatches = po.poNumber.toLowerCase().includes(query);
        const matchingItems = po.items.filter(item => 
          item.item?.materialNumber.toLowerCase().includes(query) ||
          item.item?.itemName.toLowerCase().includes(query)
        );
        
        if (poMatches) {
          return po;
        } else if (matchingItems.length > 0) {
          return { ...po, items: matchingItems };
        }
        return null;
      })
      .filter((po): po is PurchaseOrderWithItems => po !== null);
  }, [purchaseOrders, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getItemHistory = (poItemId: number) => {
    if (!allHistory) return [];
    return allHistory.filter((h: ProcessHistoryEntry) => h.poItemId === poItemId);
  };

  const getStageCompletionDate = (poItemId: number, stageIndex: number) => {
    if (!allHistory) return null;
    const historyEntry = allHistory.find(
      (h: ProcessHistoryEntry) => 
        h.poItemId === poItemId && 
        h.stageIndex === stageIndex && 
        h.action === 'completed'
    );
    return historyEntry ? historyEntry.changedAt : null;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600 text-white" data-testid="badge-action-completed">Completed</Badge>;
      case 'uncompleted':
        return <Badge variant="secondary" data-testid="badge-action-uncompleted">Uncompleted</Badge>;
      case 'remarks_added':
        return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400" data-testid="badge-action-remarks-added">Remarks Added</Badge>;
      case 'remarks_updated':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400" data-testid="badge-action-remarks-updated">Remarks Updated</Badge>;
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by PO number or material number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            data-testid="input-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            Showing {filteredPurchaseOrders.length} matching order(s) for "{searchQuery}"
          </p>
        )}
      </div>

      {filteredPurchaseOrders && filteredPurchaseOrders.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {filteredPurchaseOrders.map((po: PurchaseOrderWithItems) => (
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material No.</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {po.items.map((poItem) => {
                      const processes: ProcessStage[] = JSON.parse(poItem.processes || '[]');
                      const progress = calculateProgress(processes);
                      const itemHistory = getItemHistory(poItem.id);
                      
                      return (
                        <TableRow key={poItem.id} data-testid={`row-item-${poItem.id}`}>
                          <TableCell className="font-medium">
                            {poItem.item?.materialNumber}
                          </TableCell>
                          <TableCell>{poItem.item?.itemName}</TableCell>
                          <TableCell className="text-center">{poItem.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${poItem.priceOverride || poItem.item?.price}
                          </TableCell>
                          <TableCell className="min-w-[300px]">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{progress}%</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {processes.map((process, idx) => {
                                  const completionDate = getStageCompletionDate(poItem.id, idx);
                                  return (
                                    <div 
                                      key={idx}
                                      className={`relative group`}
                                      data-testid={`process-indicator-${poItem.id}-${idx}`}
                                    >
                                      <div 
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2
                                          ${process.completed 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : 'bg-background border-slate-300 dark:border-slate-600 text-muted-foreground'}`}
                                      >
                                        {process.completed ? (
                                          <CheckCircle2 className="w-3 h-3" />
                                        ) : (
                                          <span>{idx + 1}</span>
                                        )}
                                      </div>
                                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                                        <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                          <p className="font-medium">{process.stage}</p>
                                          {completionDate && (
                                            <p className="text-green-400">
                                              {format(new Date(completionDate), "MMM dd, HH:mm")}
                                            </p>
                                          )}
                                          {!process.completed && (
                                            <p className="text-slate-400">Pending</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openHistoryDialog(poItem.id)}
                              data-testid={`button-view-history-${poItem.id}`}
                            >
                              <History className="w-4 h-4 mr-1" />
                              History ({itemHistory.length})
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
