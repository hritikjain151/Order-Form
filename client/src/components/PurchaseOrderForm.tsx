import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseOrderSchema, VENDOR_OPTIONS, type InsertPurchaseOrderItem, type Item } from "@shared/schema";
import { useCreatePurchaseOrder, useItems } from "@/hooks/use-purchase-orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const insertPOItemSchema = z.object({
  itemId: z.coerce.number().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  priceOverride: z.coerce.number().optional(),
});

const formSchema = insertPurchaseOrderSchema.extend({
  items: z.array(insertPOItemSchema).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

export function PurchaseOrderForm({ onSuccess }: { onSuccess?: () => void }) {
  const mutation = useCreatePurchaseOrder();
  const { data: items = [], isLoading: isLoadingItems } = useItems();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNumber: "",
      department: "",
      vendorName: "RUBBER METSO",
      orderDate: new Date(),
      deliveryDate: undefined,
      remarks: "",
      items: [
        {
          itemId: 0,
          quantity: 1,
          priceOverride: undefined,
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

  const getSelectedItemDetails = (itemId: number): Item | undefined => {
    return items.find(item => item.id === itemId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/30 border border-slate-100"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* PO Header Section */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Purchase Order Details</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-700 font-medium">PO Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="PO-001" 
                        className="rounded-lg h-9 text-sm border-slate-200 focus:border-primary focus:ring-primary/10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-700 font-medium">Department</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Sales/Ops" 
                        className="rounded-lg h-9 text-sm border-slate-200 focus:border-primary focus:ring-primary/10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-700 font-medium">Vendor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-48">
                        {VENDOR_OPTIONS.map((vendor) => (
                          <SelectItem key={vendor} value={vendor} className="text-sm">{vendor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-700 font-medium">Order Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="rounded-lg h-9 text-sm" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mt-3">
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-700 font-medium">Delivery Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="rounded-lg h-9 text-sm" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-slate-700 font-medium">Remarks</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Notes..." 
                        className="rounded-lg h-9 text-sm" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Line Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  itemId: 0,
                  quantity: 1,
                  priceOverride: undefined,
                })}
                className="rounded-lg h-8 text-xs"
                disabled={isLoadingItems}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {fields.map((field, index) => {
                const selectedItem = getSelectedItemDetails(form.watch(`items.${index}.itemId`));
                
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative hover:border-primary/30 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <p className="text-xs font-semibold text-slate-500 mb-2">Item {index + 1}</p>

                    <div className="mb-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-600">Material Number</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))}>
                              <FormControl>
                                <SelectTrigger className="rounded-md h-8 text-xs">
                                  <SelectValue placeholder={isLoadingItems ? "Loading..." : "Select item"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-48">
                                {items.map((item: Item) => (
                                  <SelectItem key={item.id} value={item.id.toString()} className="text-xs">
                                    {item.materialNumber} - {item.itemName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedItem && (
                      <div className="bg-white border border-slate-200 rounded-md p-2 mb-2 text-xs">
                        <p className="font-semibold text-slate-900">{selectedItem.itemName}</p>
                        <p className="text-slate-600 text-xs line-clamp-2">{selectedItem.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-1 text-slate-500">
                          <p>DWG: {selectedItem.drawingNumber}</p>
                          <p>Price: ${selectedItem.price}</p>
                          {selectedItem.weight && <p>Weight: {selectedItem.weight}kg</p>}
                        </div>
                        {selectedItem.specialRemarks && (
                          <p className="text-amber-600 mt-1 bg-amber-50 px-1 rounded">
                            {selectedItem.specialRemarks}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-600">Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                className="rounded-md h-8 text-xs"
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
                        name={`items.${index}.priceOverride`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-600">Price Override ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={selectedItem ? selectedItem.price : "0.00"}
                                step="0.01"
                                className="rounded-md h-8 text-xs font-medium"
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {form.formState.errors.items && (
              <p className="text-xs text-destructive mt-2">{form.formState.errors.items.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => form.reset()}
            >
              Clear
            </Button>
            <Button 
              type="submit" 
              size="sm"
              className="rounded-lg text-xs bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 px-4"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-3 w-3" />
                  Create PO
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
