'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { invoiceApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AppLayout, BottomNav } from '@/components/layout';
import { PageHeader } from '@/components/ui/page-header';
import { FEATURE_IDS } from '@/lib/services/documentation.service';
import { TableSkeleton } from '@/components/ui/skeleton';
import { NoInvoicesEmpty, NoSearchResultsEmpty } from '@/components/ui/empty-state';
import { Plus, Search, FileText, Eye, Download, MoreVertical, Edit, Trash2, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { exportInvoicesToExcel, generateInvoicePDF } from '@/lib/export-utils';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  party: {
    name: string;
  };
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { isAuthenticated, businessId } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; invoice: Invoice | null; isDeleting: boolean }>({
    open: false,
    invoice: null,
    isDeleting: false,
  });
  const hasFetched = useRef(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await invoiceApi.get('/invoices');
      // Backend returns { invoices: [...], total, page, limit }
      const data = response.data?.invoices || (Array.isArray(response.data) ? response.data : (response.data?.data || []));
      setInvoices(data);
    } catch (error: any) {
      toast.error('Failed to load invoices', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !businessId) {
      router.push('/');
      return;
    }
    
    // Prevent duplicate fetches
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchInvoices();
    }
  }, [isAuthenticated, businessId, router, fetchInvoices]);

  const invoicesList = Array.isArray(invoices) ? invoices : [];

  const filteredInvoices = invoicesList.filter((invoice) => {
    const matchesSearch = invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.party?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || invoice.invoice_type === filterType;
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      // Fetch full invoice details for PDF generation
      const response = await invoiceApi.get(`/invoices/${invoice.id}`);
      const fullInvoice = response.data;
      generateInvoicePDF(fullInvoice, fullInvoice.party || invoice.party, {});
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error('Failed to download PDF', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  // Stats
  const totalSales = invoicesList
    .filter(inv => inv.invoice_type === 'sale')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  
  const pendingAmount = invoicesList
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  return (
    <AppLayout>
      <PageHeader
        title="Invoices"
        description="Create, manage and track all your invoices"
        helpFeatureId={FEATURE_IDS.INVOICES_OVERVIEW}
        action={{
          label: "Create Invoice",
          onClick: () => router.push('/invoices/create'),
        }}
      >
        <Button 
          variant="outline" 
          onClick={() => exportInvoicesToExcel(invoicesList as any)}
          disabled={invoicesList.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Invoices</div>
            <div className="text-2xl font-bold">{invoicesList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Sales</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-orange-600">
              ₹{pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Paid</div>
            <div className="text-2xl font-bold text-blue-600">
              {invoicesList.filter(inv => inv.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or party name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : invoicesList.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoInvoicesEmpty onCreateClick={() => router.push('/invoices/create')} />
          </CardContent>
        </Card>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <NoSearchResultsEmpty query={searchQuery} onClearClick={() => setSearchQuery('')} />
          </CardContent>
        </Card>
      ) : (
        /* Invoices List */
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/invoices/${invoice.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${invoice.invoice_type === 'sale' ? 'bg-green-100' : 'bg-blue-100'}`}>
                      <FileText className={`h-5 w-5 ${invoice.invoice_type === 'sale' ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{invoice.invoice_number}</span>
                        <Badge variant={getStatusVariant(invoice.status)} className="text-xs">
                          {invoice.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.party?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(invoice.due_date), 'dd MMM')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ₹{Number(invoice.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {invoice.invoice_type}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${invoice.id}`); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${invoice.id}/edit`); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownloadPDF(invoice); }}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeleteDialog({ open: true, invoice, isDeleting: false });
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={async () => {
          if (!deleteDialog.invoice) return;
          setDeleteDialog({ ...deleteDialog, isDeleting: true });
          try {
            await invoiceApi.delete(`/invoices/${deleteDialog.invoice.id}`);
            toast.success('Invoice deleted successfully');
            setDeleteDialog({ open: false, invoice: null, isDeleting: false });
            fetchInvoices();
          } catch (err: any) {
            toast.error('Failed to delete invoice', { 
              description: err.response?.data?.message || 'Please try again' 
            });
            setDeleteDialog({ ...deleteDialog, isDeleting: false });
          }
        }}
        title="Delete Invoice"
        itemName={deleteDialog.invoice?.invoice_number}
        isDeleting={deleteDialog.isDeleting}
      />

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </AppLayout>
  );
}
