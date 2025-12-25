'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout, BottomNav } from '@/components/layout';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { DocumentationService, FEATURE_IDS } from '@/lib/services/documentation.service';
import { 
  Users, 
  Package, 
  FileText, 
  CreditCard, 
  BarChart3,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  IndianRupee,
  Download,
} from 'lucide-react';
import { invoiceApi, paymentApi, partyApi, inventoryApi } from '@/lib/api-client';
import { generateDashboardReportPDF } from '@/lib/export-utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, businessId, logout } = useAuthStore();

  // Fetch dashboard data - only when authenticated and business is selected
  const { data: invoices } = useQuery({
    queryKey: ['invoices', businessId],
    queryFn: async () => {
      const response = await invoiceApi.get('/invoices');
      // Backend returns { invoices: [...], total, page, limit }
      return response.data?.invoices || (Array.isArray(response.data) ? response.data : (response.data?.data || []));
    },
    enabled: !!isAuthenticated && !!businessId,
  });

  const { data: payments } = useQuery({
    queryKey: ['payments', businessId],
    queryFn: async () => {
      const response = await paymentApi.get('/payments');
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!isAuthenticated && !!businessId,
  });

  const { data: parties } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: async () => {
      const response = await partyApi.get('/parties');
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!isAuthenticated && !!businessId,
  });

  const { data: items } = useQuery({
    queryKey: ['inventory-items', businessId],
    queryFn: async () => {
      const response = await inventoryApi.get('/items');
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!isAuthenticated && !!businessId,
  });

  // Calculate real statistics
  const invoicesList = Array.isArray(invoices) ? invoices : [];
  const paymentsList = Array.isArray(payments) ? payments : [];
  const partiesList = Array.isArray(parties) ? parties : [];
  const itemsList = Array.isArray(items) ? items : [];

  const stats = {
    totalSales: invoicesList.filter((inv: any) => inv.invoice_type === 'sale')
      .reduce((sum: number, inv: any) => sum + Number(inv.total_amount || 0), 0),
    totalPurchases: invoicesList.filter((inv: any) => inv.invoice_type === 'purchase')
      .reduce((sum: number, inv: any) => sum + Number(inv.total_amount || 0), 0),
    totalPaymentsReceived: paymentsList.filter((pay: any) => 
      invoicesList.find((inv: any) => inv.id === pay.invoice_id)?.invoice_type === 'sale'
    ).reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0),
    totalPaymentsMade: paymentsList.filter((pay: any) => 
      invoicesList.find((inv: any) => inv.id === pay.invoice_id)?.invoice_type === 'purchase'
    ).reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0),
    totalCustomers: partiesList.filter((p: any) => p.party_type === 'customer').length,
    totalSuppliers: partiesList.filter((p: any) => p.party_type === 'supplier').length,
    totalParties: partiesList.length,
    lowStockItems: itemsList.filter((item: any) => 
      Number(item.current_stock || 0) <= Number(item.min_stock_level || 0)
    ).length,
    totalItems: itemsList.length,
    pendingInvoices: invoicesList.filter((inv: any) => inv.status === 'pending').length,
    totalInvoices: invoicesList.length,
  };

  const outstandingReceivables = stats.totalSales - stats.totalPaymentsReceived;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!businessId) {
      router.push('/business/select');
    }
  }, [isAuthenticated, businessId, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const modules = [
    {
      title: 'Parties',
      description: 'Manage customers and suppliers',
      icon: Users,
      href: '/parties',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      helpId: FEATURE_IDS.PARTIES_OVERVIEW,
    },
    {
      title: 'Inventory',
      description: 'Manage items and stock',
      icon: Package,
      href: '/inventory',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      helpId: FEATURE_IDS.INVENTORY_OVERVIEW,
    },
    {
      title: 'Invoices',
      description: 'Create and manage invoices',
      icon: FileText,
      href: '/invoices',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      helpId: FEATURE_IDS.INVOICES_OVERVIEW,
    },
    {
      title: 'Payments',
      description: 'Record and track payments',
      icon: CreditCard,
      href: '/payments',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      helpId: FEATURE_IDS.PAYMENTS_OVERVIEW,
    },
    {
      title: 'Reports',
      description: 'View business insights',
      icon: BarChart3,
      href: '/reports',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      helpId: FEATURE_IDS.REPORTS_OVERVIEW,
    },
    {
      title: 'Business',
      description: 'Manage business settings',
      icon: Building2,
      href: '/business/select',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      helpId: FEATURE_IDS.BUSINESS_OVERVIEW,
    },
  ];

  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => generateDashboardReportPDF(
            {
              totalSales: stats.totalSales,
              totalPurchases: stats.totalPurchases,
              totalReceived: stats.totalPaymentsReceived,
              totalPaid: stats.totalPaymentsMade,
              receivableAmount: stats.totalSales - stats.totalPaymentsReceived,
              payableAmount: stats.totalPurchases - stats.totalPaymentsMade,
              totalParties: stats.totalParties,
              totalInvoices: stats.totalInvoices,
            },
            invoicesList.slice(0, 10) as any,
            {}
          )}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">Total Sales</CardDescription>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoicesList.filter((inv: any) => inv.invoice_type === 'sale').length} invoices
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">Outstanding</CardDescription>
            <div className="p-2 bg-orange-100 rounded-full">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{outstandingReceivables.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">Total Parties</CardDescription>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCustomers} customers
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-sm font-medium">Low Stock</CardDescription>
            <div className={`p-2 rounded-full ${stats.lowStockItems > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertCircle className={`h-4 w-4 ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lowStockItems > 0 ? 'Need attention' : 'All good'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <HelpTooltip
            content="Quick access to common tasks. Create invoices, add parties, manage inventory, and record payments."
            title="Quick Actions"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/invoices/create">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group relative">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New Invoice</p>
                  <p className="text-xs text-muted-foreground">Create sale or purchase</p>
                </div>
                <HelpTooltip
                  content={DocumentationService.getQuickHelp(FEATURE_IDS.INVOICES_OVERVIEW) || 'Create professional invoices with automatic GST calculations'}
                  side="left"
                />
              </CardContent>
            </Card>
          </Link>

          <Link href="/parties/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group relative">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Add Party</p>
                  <p className="text-xs text-muted-foreground">Customer or supplier</p>
                </div>
                <HelpTooltip
                  content={DocumentationService.getQuickHelp(FEATURE_IDS.PARTIES_OVERVIEW) || 'Add customers and suppliers with complete information'}
                  side="left"
                />
              </CardContent>
            </Card>
          </Link>

          <Link href="/inventory/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group relative">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Add Item</p>
                  <p className="text-xs text-muted-foreground">New inventory item</p>
                </div>
                <HelpTooltip
                  content={DocumentationService.getQuickHelp(FEATURE_IDS.INVENTORY_OVERVIEW) || 'Add products with prices, GST rates, and stock levels'}
                  side="left"
                />
              </CardContent>
            </Card>
          </Link>

          <Link href="/payments/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group relative">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Record Payment</p>
                  <p className="text-xs text-muted-foreground">Receive or pay</p>
                </div>
                <HelpTooltip
                  content={DocumentationService.getQuickHelp(FEATURE_IDS.PAYMENTS_OVERVIEW) || 'Record payments received from customers or made to suppliers'}
                  side="left"
                />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Modules</h2>
          <HelpTooltip
            content="Access all major features of the application. Click on any module to get started."
            title="Business Modules"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((module) => {
            const helpContent = DocumentationService.getTooltipContent(module.helpId);
            return (
              <Link key={module.href} href={module.href}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer h-full relative">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl ${module.bgColor} flex items-center justify-center mb-3`}>
                      <module.icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{module.title}</p>
                      {helpContent && (
                        <HelpTooltip
                          content={helpContent.content}
                          title={helpContent.title}
                          side="top"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
            <CardDescription>Your business at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm">Total Sales</span>
              </div>
              <span className="font-medium text-green-600">
                ₹{stats.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <span className="text-sm">Total Purchases</span>
              </div>
              <span className="font-medium text-red-600">
                ₹{stats.totalPurchases.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-sm">Payments Received</span>
              </div>
              <span className="font-medium text-green-600">
                ₹{stats.totalPaymentsReceived.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <IndianRupee className="h-4 w-4 text-red-600" />
                <span className="text-sm">Payments Made</span>
              </div>
              <span className="font-medium text-red-600">
                ₹{stats.totalPaymentsMade.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory & Party Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Stats</CardTitle>
            <CardDescription>Inventory and parties overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Total Items</span>
              </div>
              <span className="font-medium">{stats.totalItems}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Customers</span>
              </div>
              <span className="font-medium">{stats.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Suppliers</span>
              </div>
              <span className="font-medium">{stats.totalSuppliers}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-sm">Total Invoices</span>
              </div>
              <span className="font-medium">{stats.totalInvoices}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </AppLayout>
  );
}
