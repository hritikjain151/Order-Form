import { usePurchaseOrder, useUpdatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { insertPurchaseOrderSchema, VENDOR_OPTIONS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoute, useLocation } from "wouter";
import { Loader2, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

export default function EditPurchaseOrderPage() {
  const [match, params] = useRoute("/edit-po/:id");
  const [, navigate] = useLocation();
  const poId = match ? Number(params?.id) : null;
  
  const { data: po, isLoading } = usePurchaseOrder(poId || 0);
  const updateMutation = useUpdatePurchaseOrder();

  const form = useForm({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      poNumber: po?.poNumber || "",
      vendorName: (po?.vendorName as any) || "RUBBER METSO",
      orderDate: po?.orderDate ? new Date(po.orderDate) : new Date(),
      deliveryDate: po?.deliveryDate ? new Date(po.deliveryDate) : new Date(),
      remarks: po?.remarks || "",
    },
  });

  const onSubmit = (data: any) => {
    if (!poId) return;
    updateMutation.mutate(
      { id: poId, data },
      {
        onSuccess: () => {
          navigate("/");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="h-full bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-600 text-sm mb-4">Purchase Order not found</p>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Purchase Order</h1>
            <p className="text-sm text-slate-600 mt-2">Update the details of {po.poNumber}</p>
          </div>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* PO Number */}
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PO-001-2025" {...field} data-testid="input-po-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vendor Name */}
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vendor">
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VENDOR_OPTIONS.map((vendor) => (
                          <SelectItem key={vendor} value={vendor}>
                            {vendor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Date */}
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-order-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Date */}
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-delivery-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remarks */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any remarks for this purchase order..."
                        {...field}
                        className="min-h-20 resize-none"
                        data-testid="input-remarks"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Items Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Items in this Order</h3>
                <div className="space-y-2">
                  {po.items.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.item.itemName}</p>
                          <p className="text-sm text-slate-600 mt-1">Material: {item.item.materialNumber}</p>
                          <div className="flex gap-4 mt-2 text-sm text-slate-700">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit Price: ${parseFloat(item.item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
