'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Package, Tag, IndianRupee, Percent, Hash, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout, BottomNav } from '@/components/layout';
import { PageHeader } from '@/components/ui/page-header';
import { inventoryApi } from '@/lib/api-client';
import { buildInventoryItemPayload, formatApiError } from '@/lib/payload-utils';
import { toast } from 'sonner';

interface ItemFormData {
  name: string;
  sku: string;
  hsn_code: string;
  category: string;
  unit: string;
  purchase_price: string;
  selling_price: string;
  gst_rate: string;
  current_stock: string;
  low_stock_threshold: string;
  description: string;
}

const UNITS = ['pcs', 'kg', 'gm', 'ltr', 'ml', 'mtr', 'box', 'dozen', 'pair', 'set'];
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverages', 'Healthcare', 'Home & Garden', 'Office Supplies', 'Raw Materials', 'Services', 'Other'];
const GST_RATES = ['0', '5', '12', '18', '28'];

export default function NewItemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    sku: '',
    hsn_code: '',
    category: '',
    unit: 'pcs',
    purchase_price: '',
    selling_price: '',
    gst_rate: '18',
    current_stock: '0',
    low_stock_threshold: '10',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<ItemFormData>>({});

  /**
   * Creates a new inventory item
   * 
   * **Field Mappings:**
   * - `gst_rate` (form) → `tax_rate` (backend) - Handled by buildInventoryItemPayload
   * - `name` → `name` (trimmed)
   * - `selling_price` → `selling_price` (string → number)
   * - `purchase_price` → `purchase_price` (string → number, optional)
   * - `current_stock` → `current_stock` (string → integer, optional)
   * - `low_stock_threshold` → `low_stock_threshold` (string → integer, optional)
   * 
   * **Excluded Fields:**
   * - `business_id` - Added by backend from request context
   * - `category` (string) - Backend expects `category_id` (UUID). Not implemented yet.
   * - `unit` (string) - Backend expects `unit_id` (UUID). Not implemented yet.
   *   Backend will use default unit if `unit_id` is not provided.
   */
  const createItemMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      // Build clean payload using utility function
      // This handles all field mappings, empty string removal, and type conversions
      const payload = buildInventoryItemPayload({
        name: data.name,
        sku: data.sku,
        hsn_code: data.hsn_code,
        description: data.description,
        purchase_price: data.purchase_price,
        selling_price: data.selling_price,
        gst_rate: data.gst_rate,
        current_stock: data.current_stock,
        low_stock_threshold: data.low_stock_threshold,
      });

      const response = await inventoryApi.post('/items', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item created successfully');
      router.push('/inventory');
    },
    onError: (error: any) => {
      toast.error(formatApiError(error));
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ItemFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      newErrors.selling_price = 'Valid selling price is required';
    }

    if (formData.hsn_code && !/^\d{4,8}$/.test(formData.hsn_code)) {
      newErrors.hsn_code = 'HSN code should be 4-8 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createItemMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof ItemFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Auto-generate SKU from name
  const generateSKU = () => {
    if (formData.name) {
      const sku = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6) + '-' + Date.now().toString().slice(-4);
      handleChange('sku', sku);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Add New Item"
        description="Create a new inventory item"
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the item's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Item Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    placeholder="SKU-001"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generateSKU}>
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hsn_code">HSN Code</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hsn_code"
                    placeholder="e.g., 8471"
                    value={formData.hsn_code}
                    onChange={(e) => handleChange('hsn_code', e.target.value.replace(/\D/g, ''))}
                    className={`pl-10 ${errors.hsn_code ? 'border-red-500' : ''}`}
                    maxLength={8}
                  />
                </div>
                {errors.hsn_code && <p className="text-xs text-red-500">{errors.hsn_code}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Pricing
            </CardTitle>
            <CardDescription>Set purchase and selling prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Purchase Price (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="purchase_price"
                    type="number"
                    placeholder="0.00"
                    value={formData.purchase_price}
                    onChange={(e) => handleChange('purchase_price', e.target.value)}
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="selling_price"
                    type="number"
                    placeholder="0.00"
                    value={formData.selling_price}
                    onChange={(e) => handleChange('selling_price', e.target.value)}
                    className={`pl-10 ${errors.selling_price ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.selling_price && <p className="text-xs text-red-500">{errors.selling_price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst_rate">GST Rate (%)</Label>
                <Select value={formData.gst_rate} onValueChange={(value) => handleChange('gst_rate', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map(rate => (
                      <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Margin calculation */}
            {formData.purchase_price && formData.selling_price && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <span className={`font-bold ${
                    parseFloat(formData.selling_price) > parseFloat(formData.purchase_price) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ₹{(parseFloat(formData.selling_price) - parseFloat(formData.purchase_price)).toFixed(2)}
                    {' '}
                    ({((parseFloat(formData.selling_price) - parseFloat(formData.purchase_price)) / parseFloat(formData.purchase_price) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Stock Information
            </CardTitle>
            <CardDescription>Manage stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measurement</Label>
                <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_stock">Opening Stock</Label>
                <Input
                  id="current_stock"
                  type="number"
                  placeholder="0"
                  value={formData.current_stock}
                  onChange={(e) => handleChange('current_stock', e.target.value)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  placeholder="10"
                  value={formData.low_stock_threshold}
                  onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">Alert when stock falls below this</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pb-20 md:pb-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createItemMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createItemMutation.isPending ? 'Saving...' : 'Save Item'}
          </Button>
        </div>
      </form>

      <BottomNav />
    </AppLayout>
  );
}
