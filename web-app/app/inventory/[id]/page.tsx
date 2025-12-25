'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Hash,
  Layers,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout, BottomNav } from '@/components/layout';
import { PageHeader } from '@/components/ui/page-header';
import { CardSkeleton } from '@/components/ui/skeleton';
import { inventoryApi } from '@/lib/api-client';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  // Fetch item details
  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: async () => {
      const response = await inventoryApi.get(`/items/${itemId}`);
      return response.data?.data || response.data;
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
        <BottomNav />
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Item not found</p>
          <Button onClick={() => router.push('/inventory')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
        <BottomNav />
      </AppLayout>
    );
  }

  const stockLevel = Number(item.current_stock || 0);
  const lowStockThreshold = Number(item.low_stock_threshold || 0);
  const isLowStock = stockLevel <= lowStockThreshold && lowStockThreshold > 0;
  const purchasePrice = Number(item.purchase_price || 0);
  const sellingPrice = Number(item.selling_price || item.sale_price || 0);
  const margin = sellingPrice - purchasePrice;
  const marginPercent = purchasePrice > 0 ? (margin / purchasePrice * 100) : 0;
  const stockValue = stockLevel * purchasePrice;

  return (
    <AppLayout>
      <PageHeader
        title={item.name || item.item_name}
        description="Item Details"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => router.push(`/inventory/${itemId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </PageHeader>

      {/* Item Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{item.name || item.item_name}</h2>
          <div className="flex items-center gap-2 mt-1">
            {item.sku && <Badge variant="outline">{item.sku}</Badge>}
            {item.category && <Badge variant="secondary">{item.category}</Badge>}
            {isLowStock && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Current Stock</div>
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
            <div className={`text-2xl font-bold ${isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
              {stockLevel} {item.unit || 'pcs'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Stock Value</div>
              <IndianRupee className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₹{stockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Selling Price</div>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ₹{sellingPrice.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Margin</div>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
            <div className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marginPercent.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">HSN Code</p>
                <p className="font-medium">{item.hsn_code || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">SKU / Item Code</p>
                <p className="font-medium">{item.sku || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{item.category || 'Uncategorized'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-medium">{item.unit || 'pcs'}</p>
              </div>
            </div>
            {item.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">Purchase Price</span>
              <span className="font-medium">₹{purchasePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm">Selling Price</span>
              <span className="font-medium text-purple-600">₹{sellingPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg ${margin >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-sm">Profit Margin</span>
              <span className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{margin.toLocaleString('en-IN')} ({marginPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">GST Rate</span>
              <span className="font-medium text-blue-600">{item.gst_rate || 18}%</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg ${isLowStock ? 'bg-red-50' : 'bg-muted'}`}>
              <span className="text-sm">Low Stock Alert</span>
              <span className={`font-medium ${isLowStock ? 'text-red-600' : ''}`}>
                {lowStockThreshold} {item.unit || 'pcs'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement (Placeholder) */}
      <Card className="mb-20 md:mb-6">
        <CardHeader>
          <CardTitle className="text-base">Recent Stock Movement</CardTitle>
          <CardDescription>Track stock changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Stock movement history will be shown here
          </p>
        </CardContent>
      </Card>

      <BottomNav />
    </AppLayout>
  );
}
