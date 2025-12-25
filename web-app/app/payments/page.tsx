'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/auth-store';
import { paymentApi, invoiceApi, partyApi } from '@/lib/api-client';
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
import { NoPaymentsEmpty, NoSearchResultsEmpty } from '@/components/ui/empty-state';
import { Plus, Search, CreditCard, ArrowDownLeft, ArrowUpRight, MoreVertical, Eye, Trash2, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { exportPaymentsToExcel } from '@/lib/export-utils';

// Payment form validation schema - aligned with backend CreatePaymentDto
// REQUIRED: party_id, transaction_type, transaction_date, amount, payment_mode
// OPTIONAL: invoice_id, reference_number, bank_name, cheque_number, cheque_date, notes
const paymentSchema = z.object({
  party_id: z.string().min(1, 'Please select a party'),
  invoice_id: z.string().optional(), // Optional per backend
  transaction_type: z.enum(['payment_in', 'payment_out']),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => parseFloat(val) > 0,
    'Amount must be greater than 0'
  ),
  payment_mode: z.enum(['cash', 'bank', 'upi', 'cheque', 'credit', 'card']),
  reference_number: z.string().optional(),
  bank_name: z.string().optional(),
  cheque_number: z.string().optional(),
  cheque_date: z.string().optional(),
  notes: z.string().optional(),
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

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Payment {
  id: string;
  party_id?: string;
  party?: {
    name: string;
  };
  invoice_id?: string;
  invoice?: {
    invoice_number: string;
    party?: {
      name: string;
    };
  };
  transaction_type?: string;
  amount: number;
  payment_mode: string;
  transaction_date: string;
  reference_number?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  party_id?: string;
  party?: {
    name: string;
  };
  total_amount?: number;
  paid_amount?: number;
}

interface Party {
  id: string;
  name: string;
  type: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, businessId } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; payment: Payment | null; isDeleting: boolean }>({
    open: false,
    payment: null,
    isDeleting: false,
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      party_id: '',
      invoice_id: '',
      transaction_type: 'payment_in',
      transaction_date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_mode: 'cash',
      reference_number: '',
      bank_name: '',
      cheque_number: '',
      cheque_date: '',
      notes: '',
    },
  });

  const selectedPartyId = form.watch('party_id');
  const selectedPaymentMode = form.watch('payment_mode');

  useEffect(() => {
    if (!isAuthenticated || !businessId) {
      router.push('/');
    } else {
      fetchData();
    }
  }, [isAuthenticated, businessId, router]);

  const fetchData = async () => {
    try {
      const [paymentsRes, invoicesRes, partiesRes] = await Promise.all([
        paymentApi.get('/payments'),
        invoiceApi.get('/invoices'),
        partyApi.get('/parties'),
      ]);
      
      const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : (paymentsRes.data?.payments || paymentsRes.data?.data || []);
      const invoicesData = Array.isArray(invoicesRes.data) ? invoicesRes.data : (invoicesRes.data?.invoices || invoicesRes.data?.data || []);
      const partiesData = Array.isArray(partiesRes.data) ? partiesRes.data : (partiesRes.data?.parties || partiesRes.data?.data || []);
      
      setPayments(paymentsData);
      setInvoices(invoicesData);
      setParties(partiesData);
    } catch (error: any) {
      toast.error('Failed to load data', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      // Build payload with ONLY backend-expected fields
      const rawPayload = {
        party_id: data.party_id,
        invoice_id: data.invoice_id || undefined,
        transaction_type: data.transaction_type,
        transaction_date: data.transaction_date,
        amount: parseFloat(data.amount),
        payment_mode: data.payment_mode,
        reference_number: data.reference_number || undefined,
        bank_name: data.bank_name || undefined,
        cheque_number: data.cheque_number || undefined,
        cheque_date: data.cheque_date || undefined,
        notes: data.notes || undefined,
      };

      // Clean the payload - remove empty/undefined values
      const payload = cleanPayload(rawPayload);

      await paymentApi.post('/payments', payload);
      toast.success('Payment recorded successfully');
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error('Failed to record payment', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const invoicesList = Array.isArray(invoices) ? invoices : [];
  const paymentsList = Array.isArray(payments) ? payments : [];
  const partiesList = Array.isArray(parties) ? parties : [];

  // Filter invoices for selected party
  const partyInvoices = selectedPartyId 
    ? invoicesList.filter(inv => inv.party_id === selectedPartyId)
    : invoicesList;
  const pendingInvoices = partyInvoices.filter(inv => (inv.paid_amount || 0) < (inv.total_amount || 0));

  const filteredPayments = paymentsList.filter((payment) => {
    const partyName = payment.party?.name || payment.invoice?.party?.name || '';
    const invoiceNumber = payment.invoice?.invoice_number || '';
    return partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Stats
  const totalReceived = paymentsList
    .filter(p => p.transaction_type === 'payment_in')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalPaid = paymentsList
    .filter(p => p.transaction_type === 'payment_out')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader 
          title="Payments" 
          description="Record and track payments"
          helpFeatureId={FEATURE_IDS.PAYMENTS_OVERVIEW}
        />
        <TableSkeleton rows={5} columns={4} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Payments"
        description="Record and track payments"
        helpFeatureId={FEATURE_IDS.PAYMENTS_OVERVIEW}
      >
        <Button 
          variant="outline" 
          onClick={() => exportPaymentsToExcel(paymentsList)}
          disabled={paymentsList.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Enter payment details
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="transaction_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="payment_in">Payment In (Received)</SelectItem>
                              <SelectItem value="payment_out">Payment Out (Made)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="party_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Party *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select party" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partiesList.map((party) => (
                                <SelectItem key={party.id} value={party.id}>
                                  {party.name} ({party.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoice_id"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Invoice (Optional)</FormLabel>
                            <HelpTooltip
                              content="Optionally link this payment to a specific invoice. This helps track which invoices have been paid and shows remaining balances."
                              title="Link to Invoice"
                            />
                          </div>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Link to invoice (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pendingInvoices.map((invoice) => {
                                const pending = Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0);
                                return (
                                  <SelectItem key={invoice.id} value={invoice.id}>
                                    {invoice.invoice_number} (₹{pending.toFixed(2)} pending)
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payment_mode"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Payment Mode *</FormLabel>
                            <HelpTooltip
                              content="Select how the payment was made. This helps with reconciliation and tracking different payment methods."
                              title="Payment Mode"
                            />
                          </div>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transaction_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Transaction ID, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Show bank/cheque fields when relevant */}
                    {(selectedPaymentMode === 'bank' || selectedPaymentMode === 'cheque') && (
                      <FormField
                        control={form.control}
                        name="bank_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedPaymentMode === 'cheque' && (
                      <>
                        <FormField
                          control={form.control}
                          name="cheque_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cheque Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Cheque number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cheque_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cheque Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Any additional notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                        {isSubmitting ? 'Recording...' : 'Record Payment'}
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
                <div className="text-sm text-muted-foreground">Total Payments</div>
                <div className="text-2xl font-bold">{paymentsList.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Received</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalReceived.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="text-2xl font-bold text-red-600">
                  ₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Net Flow</div>
                <div className={`text-2xl font-bold ${totalReceived - totalPaid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(totalReceived - totalPaid).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, party name, or reference..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Payments List */}
          {paymentsList.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <NoPaymentsEmpty onCreateClick={() => setIsDialogOpen(true)} />
              </CardContent>
            </Card>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <NoSearchResultsEmpty query={searchQuery} onClearClick={() => setSearchQuery('')} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => {
                const isPaymentIn = payment.transaction_type === 'payment_in';
                return (
                  <Card key={payment.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/payments/${payment.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${isPaymentIn ? 'bg-green-100' : 'bg-red-100'}`}>
                            {isPaymentIn ? (
                              <ArrowDownLeft className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {payment.party?.name || payment.invoice?.party?.name || 'Unknown'}
                              </span>
                              <Badge variant={isPaymentIn ? 'default' : 'secondary'} className="text-xs">
                                {isPaymentIn ? 'IN' : 'OUT'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payment.payment_mode?.toUpperCase().replace('_', ' ')}
                              {payment.reference_number && ` • ${payment.reference_number}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm text-muted-foreground">
                              {payment.transaction_date ? format(new Date(payment.transaction_date), 'dd MMM yyyy') : 'N/A'}
                            </p>
                            {payment.invoice?.invoice_number && (
                              <p className="text-xs text-muted-foreground">
                                {payment.invoice.invoice_number}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${isPaymentIn ? 'text-green-600' : 'text-red-600'}`}>
                              {isPaymentIn ? '+' : '-'}₹{Number(payment.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/payments/${payment.id}`); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setDeleteDialog({ open: true, payment, isDeleting: false });
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
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
            onConfirm={async () => {
              if (!deleteDialog.payment) return;
              setDeleteDialog({ ...deleteDialog, isDeleting: true });
              try {
                await paymentApi.delete(`/payments/${deleteDialog.payment.id}`);
                toast.success('Payment deleted successfully');
                setDeleteDialog({ open: false, payment: null, isDeleting: false });
                fetchData();
              } catch (err: any) {
                toast.error('Failed to delete payment', { 
                  description: err.response?.data?.message || 'Please try again' 
                });
                setDeleteDialog({ ...deleteDialog, isDeleting: false });
              }
            }}
            title="Delete Payment"
            description={`Are you sure you want to delete this payment of ₹${Number(deleteDialog.payment?.amount || 0).toLocaleString('en-IN')}? This action cannot be undone.`}
            isDeleting={deleteDialog.isDeleting}
          />

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </AppLayout>
      );
    }
