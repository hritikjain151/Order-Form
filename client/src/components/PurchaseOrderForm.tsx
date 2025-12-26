import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseOrderSchema, insertPurchaseOrderItemSchema, type InsertPurchaseOrderItem, VENDOR_OPTIONS } from "@shared/schema";
import { useCreatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const formSchema = insertPurchaseOrderSchema.extend({
  items: z.array(insertPurchaseOrderItemSchema).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

export function PurchaseOrderForm({ onSuccess }: { onSuccess?: () => void }) {
  const mutation = useCreatePurchaseOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNumber: "",
      vendorName: "RUBBER METSO",
      orderDate: new Date(),
      deliveryDate: undefined,
      remarks: "",
      items: [
        {
          materialNumber: "",
          drawingNumber: "",
          partName: "",
          description: "",
          importantRemarks: "",
          quantity: 1,
          price: 0,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data as any, {
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
        <p className="text-slate-500 mt-1">Create a purchase order with multiple line items.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* PO Header Section */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Purchase Order Details</h3>
            
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
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel className="text-slate-700 font-medium">Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes or special instructions..." 
                      className="rounded-xl min-h-[100px] resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Line Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  materialNumber: "",
                  drawingNumber: "",
                  partName: "",
                  description: "",
                  importantRemarks: "",
                  quantity: 1,
                  price: 0,
                })}
                className="rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-slate-200 rounded-2xl p-6 relative hover:border-primary/30 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="pr-10">
                    <p className="text-sm font-semibold text-slate-500 mb-4">Item {index + 1}</p>

                    {/* Material & Drawing Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.materialNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Material Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MAT-12345" 
                                className="rounded-lg h-10 text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.drawingNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Drawing Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="DWG-67890" 
                                className="rounded-lg h-10 text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Part Name */}
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.partName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Part Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Rubber Seal Assembly" 
                                className="rounded-lg h-10 text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed description..." 
                                className="rounded-lg min-h-[80px] resize-none text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Important Remarks */}
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.importantRemarks`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Important Remarks</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special handling or important notes..." 
                                className="rounded-lg min-h-[70px] resize-none text-sm" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                className="rounded-lg h-10 text-sm"
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-slate-700">Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                step="0.01"
                                className="rounded-lg h-10 text-sm font-medium"
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {form.formState.errors.items && (
              <p className="text-sm text-destructive mt-2">{form.formState.errors.items.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button 
              type="button"
              variant="outline"
              className="px-6 rounded-lg"
              onClick={() => form.reset()}
            >
              Clear
            </Button>
            <Button 
              type="submit" 
              className="h-12 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
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
