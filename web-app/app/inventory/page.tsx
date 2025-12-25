'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/auth-store';
import { inventoryApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { toast } from 'sonner';
import { AppLayout, BottomNav } from '@/components/layout';
import { PageHeader } from '@/components/ui/page-header';
import { FEATURE_IDS } from '@/lib/services/documentation.service';
import { TableSkeleton } from '@/components/ui/skeleton';
import { NoItemsEmpty, NoSearchResultsEmpty } from '@/components/ui/empty-state';
import { Plus, Search, Package, AlertTriangle, MoreVertical, Edit, Eye, Trash2, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { exportInventoryToExcel } from '@/lib/export-utils';

// Item form validation schema - aligned with backend CreateItemDto
// REQUIRED: name, selling_price only
// ALL OTHER FIELDS ARE OPTIONAL
const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name too long'),
  description: z.string().optional(),
  category: z.string().optional(),
  hsn_code: z.string().optional().refine(
    (val) => !val || (val.length >= 4 && val.length <= 8),
    'HSN code must be 4-8 characters'
  ),
  unit: z.string().optional(),
  selling_price: z.string().min(1, 'Selling price is required'),
  purchase_price: z.string().optional(),
  tax_rate: z.string().optional(),
  opening_stock: z.string().optional(),
  min_stock_level: z.string().optional(),
});

// Helper to clean payload - removes empty strings and undefined values
const cleanPayload = (data: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

type ItemFormValues = z.infer<typeof itemSchema>;

interface Item {
  id: string;
  name: string;
  description?: string;
  category?: string;
  hsn_code?: string;
  unit?: string;
  selling_price: number;
  purchase_price?: number;
  tax_rate?: number;
  current_stock?: number;
  low_stock_threshold?: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated, businessId } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Item | null; isDeleting: boolean }>({
    open: false,
    item: null,
    isDeleting: false,
  });

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      hsn_code: '',
      unit: 'pcs',
      selling_price: '',
      purchase_price: '',
      tax_rate: '18',
      opening_stock: '0',
      min_stock_level: '10',
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !businessId) {
      router.push('/');
    } else {
      fetchItems();
    }
  }, [isAuthenticated, businessId, router]);

  const fetchItems = async () => {
    try {
      const response = await inventoryApi.get('/items');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setItems(data);
    } catch (error: any) {
      toast.error('Failed to load items', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ItemFormValues) => {
    setIsSubmitting(true);
    try {
      // Build payload with only backend-expected fields
      const rawPayload = {
        name: data.name,
        description: data.description,
        hsn_code: data.hsn_code,
        selling_price: parseFloat(data.selling_price),
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : undefined,
        tax_rate: data.tax_rate ? parseFloat(data.tax_rate) : undefined,
        current_stock: data.opening_stock ? parseFloat(data.opening_stock) : undefined,
        low_stock_threshold: data.min_stock_level ? parseFloat(data.min_stock_level) : undefined,
      };
      
      // Remove empty strings and undefined values
      const payload = cleanPayload(rawPayload);

      await inventoryApi.post('/items', payload);
      toast.success('Item created successfully');
      setIsDialogOpen(false);
      form.reset();
      fetchItems();
    } catch (error: any) {
      toast.error('Failed to create item', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsList = Array.isArray(items) ? items : [];
  const categories = Array.from(new Set(itemsList.map(item => item.category).filter(Boolean)));

  const filteredItems = itemsList.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hsn_code?.includes(searchQuery);
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLowStock = !showLowStock || (item.low_stock_threshold && (item.current_stock || 0) <= item.low_stock_threshold);
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Stats
  const totalValue = itemsList.reduce((sum, item) => 
    sum + (Number(item.current_stock || 0) * Number(item.selling_price || 0)), 0);
  const lowStockCount = itemsList.filter(item => 
    item.low_stock_threshold && (item.current_stock || 0) <= item.low_stock_threshold).length;

  return (
    <AppLayout>
      <PageHeader
        title="Inventory"
        description="Manage products, services, and stock"
        helpFeatureId={FEATURE_IDS.INVENTORY_OVERVIEW}
      >
        <Button 
          variant="outline" 
          onClick={() => exportInventoryToExcel(itemsList)}
          disabled={itemsList.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                      Enter item details. All prices are in ₹.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Product Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Electronics, Furniture, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hsn_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HSN Code</FormLabel>
                              <FormControl>
                                <Input placeholder="8471" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                  <SelectItem value="ltr">Liter (ltr)</SelectItem>
                                  <SelectItem value="mtr">Meter (mtr)</SelectItem>
                                  <SelectItem value="box">Box</SelectItem>
                                  <SelectItem value="dozen">Dozen</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tax_rate"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>GST Rate (%)</FormLabel>
                                <HelpTooltip
                                  content="Select the applicable GST rate for this item. Common rates: 0% (exempt), 5%, 12%, 18%, 28%. This rate will be used when creating invoices."
                                  title="GST Rate"
                                />
                              </div>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select GST rate" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="12">12%</SelectItem>
                                  <SelectItem value="18">18%</SelectItem>
                                  <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="selling_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selling Price (₹) *</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="purchase_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Price (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="800.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="opening_stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opening Stock</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="min_stock_level"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>Min Stock Level</FormLabel>
                                <HelpTooltip
                                  content="Set the minimum stock level. You'll receive alerts when stock falls below this level. Helps prevent stockouts."
                                  title="Minimum Stock Level"
                                />
                              </div>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Creating...' : 'Create Item'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </PageHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Items</div>
                <div className="text-2xl font-bold">{itemsList.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Stock Value</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Low Stock</div>
                <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, description, or HSN code..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock
          </Button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : itemsList.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <NoItemsEmpty onCreateClick={() => setIsDialogOpen(true)} />
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <NoSearchResultsEmpty query={searchQuery} onClearClick={() => setSearchQuery('')} />
              </CardContent>
            </Card>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isLowStock = item.low_stock_threshold && (item.current_stock || 0) <= item.low_stock_threshold;
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/inventory/${item.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isLowStock ? 'bg-orange-100' : 'bg-green-100'}`}>
                            <Package className={`h-5 w-5 ${isLowStock ? 'text-orange-600' : 'text-green-600'}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {item.name}
                              {isLowStock && (
                                <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                              )}
                            </CardTitle>
                            {item.hsn_code && (
                              <p className="text-xs text-muted-foreground">HSN: {item.hsn_code}</p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/inventory/${item.id}`); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/inventory/${item.id}/edit`); }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setDeleteDialog({ open: true, item, isDeleting: false });
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Selling Price</p>
                          <p className="font-semibold text-green-600">
                            ₹{Number(item.selling_price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stock</p>
                          <p className={`font-semibold ${isLowStock ? 'text-orange-600' : ''}`}>
                            {item.current_stock || 0} {item.unit || 'pcs'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                        <span>GST: {item.tax_rate || 0}%</span>
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
            onConfirm={async () => {
              if (!deleteDialog.item) return;
              setDeleteDialog({ ...deleteDialog, isDeleting: true });
              try {
                await inventoryApi.delete(`/items/${deleteDialog.item.id}`);
                toast.success('Item deleted successfully');
                setDeleteDialog({ open: false, item: null, isDeleting: false });
                fetchItems();
              } catch (err: any) {
                toast.error('Failed to delete item', { 
                  description: err.response?.data?.message || 'Please try again' 
                });
                setDeleteDialog({ ...deleteDialog, isDeleting: false });
              }
            }}
            title="Delete Item"
            itemName={deleteDialog.item?.name}
            isDeleting={deleteDialog.isDeleting}
          />

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </AppLayout>
      );
    }
