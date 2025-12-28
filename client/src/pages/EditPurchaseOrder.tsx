import { usePurchaseOrder, useUpdatePurchaseOrder, useItems, useAddPurchaseOrderItem, useUpdatePurchaseOrderItem, useDeletePurchaseOrderItem } from "@/hooks/use-purchase-orders";
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
import { Loader2, ChevronLeft, Plus, Edit2, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function EditPurchaseOrderPage() {
  const [match, params] = useRoute("/edit-po/:id");
  const [, navigate] = useLocation();
  const poId = match ? Number(params?.id) : null;
  
  const { data: po, isLoading } = usePurchaseOrder(poId || 0);
  const { data: allItems = [] } = useItems();
  const updateMutation = useUpdatePurchaseOrder();
  const addItemMutation = useAddPurchaseOrderItem();
  const updateItemMutation = useUpdatePurchaseOrderItem();
  const deleteItemMutation = useDeletePurchaseOrderItem();

  const [editingItem, setEditingItem] = useState<any>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const form = useForm({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      poNumber: "",
      vendorName: "RUBBER METSO",
      orderDate: new Date(),
      deliveryDate: new Date(),
      remarks: "",
    },
  });

  // Update form values when PO data loads
  useEffect(() => {
    if (po) {
      form.reset({
        poNumber: po.poNumber,
        vendorName: (po.vendorName as any) || "RUBBER METSO",
        orderDate: new Date(po.orderDate),
        deliveryDate: new Date(po.deliveryDate),
        remarks: po.remarks || "",
      });
    }
  }, [po, form]);

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

  const getFilteredItems = () => {
    if (!itemSearch.trim()) return [];
    const lowerQuery = itemSearch.toLowerCase();
    return allItems.filter(item =>
      item.materialNumber.toLowerCase().includes(lowerQuery) ||
      item.itemName.toLowerCase().includes(lowerQuery)
    );
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setItemSearch("");
    setItemPrice(item.price);
  };

  const handleAddItem = () => {
    if (!selectedItem || !itemQuantity) return;
    addItemMutation.mutate({
      poId: poId!,
      data: {
        itemId: selectedItem.id,
        quantity: parseInt(itemQuantity),
        priceOverride: itemPrice && itemPrice !== selectedItem.price ? parseFloat(itemPrice) : null,
      }
    }, {
      onSuccess: () => {
        setAddingItem(false);
        setSelectedItem(null);
        setItemQuantity("");
        setItemPrice("");
        setItemSearch("");
      }
    });
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    updateItemMutation.mutate({
      itemId: editingItem.id,
      poId: poId!,
      data: {
        quantity: parseInt(itemQuantity) || editingItem.quantity,
        priceOverride: itemPrice && itemPrice !== editingItem.item.price ? parseFloat(itemPrice) : editingItem.priceOverride,
      }
    }, {
      onSuccess: () => {
        setEditingItem(null);
        setItemQuantity("");
        setItemPrice("");
      }
    });
  };

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate({ itemId, poId: poId! });
    }
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setItemQuantity(String(item.quantity));
    setItemPrice(item.priceOverride ? String(item.priceOverride) : String(item.item.price));
  };

  const filteredItems = getFilteredItems();

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <Card className="p-6 mb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* PO Number - Auto-filled and Read-only */}
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled 
                        className="bg-slate-100 cursor-not-allowed"
                        data-testid="input-po-number" 
                      />
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

        {/* Items Management Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Items in this Order</h3>
            <Button
              size="sm"
              onClick={() => setAddingItem(true)}
              data-testid="button-add-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {po.items && po.items.length > 0 ? (
            <div className="space-y-3">
              {po.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.item.itemName}</p>
                    <p className="text-sm text-slate-600 mt-1">Material: {item.item.materialNumber}</p>
                    <div className="flex gap-4 mt-2 text-sm text-slate-700">
                      <span>Qty: {item.quantity}</span>
                      <span>Unit Price: ${parseFloat(item.priceOverride || item.item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEditModal(item)}
                      data-testid={`button-edit-item-${item.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      data-testid={`button-delete-item-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-8">No items in this order yet</p>
          )}
        </Card>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addingItem} onOpenChange={(open) => {
        setAddingItem(open);
        if (!open) {
          setSelectedItem(null);
          setItemQuantity("");
          setItemPrice("");
          setItemSearch("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Item to Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedItem ? (
              <>
                {/* Item Search */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Search Material Number or Item Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Input
                      placeholder="e.g., MAT-12345 or Rubber Gasket"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="pl-10"
                      data-testid="input-item-search"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Filtered Items List */}
                {itemSearch.trim() && (
                  <div className="border border-slate-200 rounded-md bg-white max-h-80 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                            data-testid={`item-option-${item.id}`}
                          >
                            <p className="font-medium text-slate-900 text-sm">{item.itemName}</p>
                            <p className="text-xs text-slate-600 mt-1">Material: {item.materialNumber}</p>
                            <p className="text-xs text-slate-500 mt-1">Price: ${parseFloat(item.price).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">No items found</div>
                    )}
                  </div>
                )}

                {!itemSearch.trim() && (
                  <p className="text-xs text-slate-500 text-center py-4">Start typing to search items</p>
                )}
              </>
            ) : (
              <>
                {/* Selected Item Details */}
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <p className="font-semibold text-slate-900">{selectedItem.itemName}</p>
                  <p className="text-sm text-slate-600 mt-2">Material Number: {selectedItem.materialNumber}</p>
                  <p className="text-sm text-slate-600 mt-1">Default Unit Price: ${parseFloat(selectedItem.price).toFixed(2)}</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null);
                      setItemQuantity("");
                      setItemPrice("");
                    }}
                    className="mt-3 p-0 h-auto"
                    data-testid="button-change-item"
                  >
                    Change Item
                  </Button>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Quantity *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    min="1"
                    data-testid="input-item-quantity"
                  />
                </div>

                {/* Unit Price Override */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Unit Price (Optional - leave blank for default)</label>
                  <Input
                    type="number"
                    placeholder={`Default: $${parseFloat(selectedItem.price).toFixed(2)}`}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    step="0.01"
                    data-testid="input-item-price"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(null);
                      setItemQuantity("");
                      setItemPrice("");
                    }}
                    className="flex-1"
                    data-testid="button-cancel-add-item"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!itemQuantity || addItemMutation.isPending}
                    className="flex-1"
                    data-testid="button-confirm-add-item"
                  >
                    {addItemMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Item"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                <p className="font-semibold text-slate-900">{editingItem.item.itemName}</p>
                <p className="text-sm text-slate-600 mt-2">Material: {editingItem.item.materialNumber}</p>
                <p className="text-sm text-slate-600 mt-1">Default Unit Price: ${parseFloat(editingItem.item.price).toFixed(2)}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Quantity *</label>
                <Input
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  min="1"
                  data-testid="input-edit-quantity"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Unit Price (Optional - leave blank for default)</label>
                <Input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder={`Default: $${parseFloat(editingItem.item.price).toFixed(2)}`}
                  step="0.01"
                  data-testid="input-edit-price"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="flex-1"
                  data-testid="button-cancel-edit-item"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditItem}
                  disabled={updateItemMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-edit-item"
                >
                  {updateItemMutation.isPending ? (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
