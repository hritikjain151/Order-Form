import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema, VENDOR_OPTIONS, type Item } from "@shared/schema";
import { useItems, useUpdateItem } from "@/hooks/use-purchase-orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Edit2, Search } from "lucide-react";
import { z } from "zod";

const formSchema = insertItemSchema;
type FormData = z.infer<typeof formSchema>;

export default function ItemDetailsPage() {
  const { data: allItems = [], isLoading: isLoadingItems } = useItems();
  const updateMutation = useUpdateItem();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    
    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.materialNumber.toLowerCase().includes(query) ||
        item.itemName.toLowerCase().includes(query) ||
        item.drawingNumber.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    form.reset({
      materialNumber: item.materialNumber,
      vendorName: item.vendorName,
      drawingNumber: item.drawingNumber,
      revisionNumber: item.revisionNumber,
      itemName: item.itemName,
      description: item.description,
      specialRemarks: item.specialRemarks,
      price: Number(item.price),
      weight: item.weight ? Number(item.weight) : undefined,
    });
  };

  const onSubmit = (data: FormData) => {
    if (!editingItem) return;

    updateMutation.mutate(
      { id: editingItem.id, data },
      {
        onSuccess: () => {
          setEditingItem(null);
          form.reset();
        },
      }
    );
  };

  const handleCloseDialog = () => {
    setEditingItem(null);
    form.reset();
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Item Details</h1>
          <p className="text-sm text-slate-600 mt-1">Search and manage your material items</p>
        </div>

        {/* Search Box */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by material number, item name, or drawing number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm border-slate-200 rounded-lg"
            data-testid="input-search-items"
          />
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-100 overflow-hidden">
          {isLoadingItems ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600 text-sm">
                {searchQuery.trim() ? "No items found matching your search" : "No items available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Material Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      data-testid={`row-item-${item.id}`}
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {item.materialNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.itemName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.vendorName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">${item.price}</td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(item)}
                          className="gap-1.5"
                          data-testid={`button-edit-item-${item.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item Details</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="materialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-slate-700 font-medium">
                      Material Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MAT-001"
                        className="rounded-lg h-9 text-sm border-slate-200"
                        {...field}
                        data-testid="input-edit-material-number"
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
                        placeholder="Item name"
                        className="rounded-lg h-9 text-sm border-slate-200"
                        {...field}
                        data-testid="input-edit-item-name"
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VENDOR_OPTIONS.map((vendor) => (
                          <SelectItem key={vendor} value={vendor} className="text-sm">
                            {vendor}
                          </SelectItem>
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
                        className="rounded-lg h-9 text-sm border-slate-200"
                        {...field}
                        data-testid="input-edit-drawing-number"
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
                        className="rounded-lg h-9 text-sm border-slate-200"
                        {...field}
                        data-testid="input-edit-revision-number"
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
                    <FormLabel className="text-sm text-slate-700 font-medium">Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="rounded-lg h-9 text-sm border-slate-200"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-edit-price"
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
                    <FormLabel className="text-sm text-slate-700 font-medium">Weight (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="rounded-lg h-9 text-sm border-slate-200"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        data-testid="input-edit-weight"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-slate-700 font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Item description"
                        className="rounded-lg text-sm border-slate-200"
                        {...field}
                        data-testid="textarea-edit-description"
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
                        placeholder="Special remarks (optional)"
                        className="rounded-lg text-sm border-slate-200"
                        {...field}
                        data-testid="textarea-edit-remarks"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-edit"
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
