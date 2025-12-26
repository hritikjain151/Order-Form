import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseOrderSchema, type InsertPurchaseOrder } from "@shared/schema";
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
      vendorName: "",
      totalAmount: 0,
      description: "",
      department: "",
      requesterName: "",
      status: "Pending",
      remarks: "",
      // Dates default to today via schema default but we'll set explicitly for controlled inputs
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
        <p className="text-slate-500 mt-1">Fill in the details to generate a new PO request.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Field 1: PO Number */}
            <FormField
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">PO Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="123456789012" 
                        maxLength={12}
                        className="font-mono text-lg tracking-wide border-slate-200 focus:border-primary focus:ring-primary/10 rounded-xl h-12" 
                        {...field} 
                      />
                      <div className="absolute right-3 top-3 text-xs text-slate-400 font-mono">
                        {field.value?.length || 0}/12
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field 2: Vendor Name */}
            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp Inc." className="rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field 3: Order Date */}
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

            {/* Field 4: Total Amount */}
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Total Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="rounded-xl h-12 text-lg font-medium"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field 6: Department */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IT">IT Infrastructure</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance & Accounting</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Sales">Sales & Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field 7: Requester Name */}
            <FormField
              control={form.control}
              name="requesterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Requester Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field 8: Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "Pending"}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field 9: Delivery Date */}
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
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Field 5: Description - Full Width */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter detailed description of items or services..." 
                    className="rounded-xl min-h-[100px] resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field 10: Remarks - Full Width */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Remarks</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional notes..." 
                    className="rounded-xl min-h-[80px] resize-none" 
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
