import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema, VENDOR_OPTIONS, type Item } from "@shared/schema";
import { useCreateItem, useItems } from "@/hooks/use-purchase-orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const formSchema = insertItemSchema;
type FormData = z.infer<typeof formSchema>;

export default function ItemsPage() {
  const mutation = useCreateItem();
  const { data: allItems = [], isLoading: isLoadingItems } = useItems();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialNumber: "",
      vendorName: "RUBBER METSO",
      drawingNumber: "",
      revisionNumber: "1.0",
      itemName: "",
      description: "",
      specialRemarks: "",
      price: 0,
      weight: undefined,
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Material Items</h1>
              <p className="text-sm text-slate-600 mt-1">Add and manage your material items</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/30 border border-slate-100"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="materialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-slate-700 font-medium">Material Number (Unique)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="MAT-001" 
                              className="rounded-lg h-10 text-sm border-slate-200" 
                              {...field} 
                              data-testid="input-material-number"
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
                          <FormLabel className="text-sm text-slate-700 font-medium">Vendor Name</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg h-10 text-sm" data-testid="select-vendor">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                      name="drawingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-slate-700 font-medium">Drawing Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="DWG-001" 
                              className="rounded-lg h-10 text-sm border-slate-200" 
                              {...field}
                              data-testid="input-drawing-number"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="revisionNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-slate-700 font-medium">Revision Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="1.0" 
                              className="rounded-lg h-10 text-sm border-slate-200" 
                              {...field}
                              data-testid="input-revision-number"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="itemName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-slate-700 font-medium">Item Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Assembly" 
                              className="rounded-lg h-10 text-sm border-slate-200" 
                              {...field}
                              data-testid="input-item-name"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-slate-700 font-medium">Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01"
                              className="rounded-lg h-10 text-sm font-medium"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-price"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-slate-700 font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Item details and specifications..." 
                            className="rounded-lg min-h-[80px] resize-none text-sm" 
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialRemarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-slate-700 font-medium">Special Remarks</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Special handling, storage, or other remarks..." 
                            className="rounded-lg min-h-[70px] resize-none text-sm" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="textarea-remarks"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-slate-700 font-medium">Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01"
                            className="rounded-lg h-10 text-sm"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value || ""}
                            data-testid="input-weight"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => form.reset()}
                      data-testid="button-clear"
                    >
                      Clear
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm"
                      className="rounded-lg text-xs bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 px-4"
                      disabled={mutation.isPending}
                      data-testid="button-add-item"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1 h-3 w-3" />
                          Add Item
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </div>

          {/* Right Column: Items List */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Items in Database</h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/30">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">{allItems.length} items</h3>
              </div>
              
              {isLoadingItems ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : allItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No items yet. Add your first item using the form.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {allItems.map((item: Item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-5 py-3 hover:bg-slate-50 transition-colors"
                      data-testid={`card-item-${item.id}`}
                    >
                      <p className="font-mono text-xs font-bold text-slate-900 mb-1">
                        {item.materialNumber}
                      </p>
                      <p className="text-xs text-slate-600 font-medium mb-1">
                        {item.itemName}
                      </p>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p>Rev: {item.revisionNumber}</p>
                        <p>${item.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
