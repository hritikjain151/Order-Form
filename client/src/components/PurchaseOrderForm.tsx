import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseOrderSchema, type InsertPurchaseOrder, VENDOR_OPTIONS } from "@shared/schema";
import { useCreatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export function PurchaseOrderForm({ onSuccess }: { onSuccess?: () => void }) {
  const mutation = useCreatePurchaseOrder();

  const form = useForm<InsertPurchaseOrder>({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      poNumber: "",
      vendorName: "RUBBER METSO",
      materialNumber: "",
      drawingNumber: "",
      partName: "",
      description: "",
      importantRemarks: "",
      quantity: 1,
      price: 0,
      remarks: "",
      orderDate: new Date(),
    },
  });

  const onSubmit = (data: InsertPurchaseOrder) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
    >
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-display">New Purchase Order</h2>
        <p className="text-slate-500 mt-1">Fill in all details for the purchase order request.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Row 1: PO Number & Vendor Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">PO Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., PO-001-2025" 
                      className="rounded-xl h-12 border-slate-200 focus:border-primary focus:ring-primary/10" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Vendor Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VENDOR_OPTIONS.map((vendor) => (
                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Order Date & Material Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Order Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="rounded-xl h-12 block w-full" 
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="materialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Material Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., MAT-12345" 
                      className="rounded-xl h-12" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Drawing Number & Part Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="drawingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Drawing Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., DWG-67890" 
                      className="rounded-xl h-12" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Part Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Rubber Seal Assembly" 
                      className="rounded-xl h-12" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Full Width: Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of the material..." 
                    className="rounded-xl min-h-[100px] resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Width: Important Remarks */}
          <FormField
            control={form.control}
            name="importantRemarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Important Remarks</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special handling or important notes..." 
                    className="rounded-xl min-h-[80px] resize-none" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 4: Quantity & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="rounded-xl h-12"
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="rounded-xl h-12 text-lg font-medium"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 5: Delivery Date */}
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Delivery Date (Est.)</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="rounded-xl h-12 block w-full" 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Width: Remarks */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Remarks</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional notes or special instructions..." 
                    className="rounded-xl min-h-[120px] resize-none" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Purchase Order
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
