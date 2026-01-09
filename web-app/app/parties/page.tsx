'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/auth-store';
import { partyApi } from '@/lib/api-client';
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
import { NoPartiesEmpty, NoSearchResultsEmpty } from '@/components/ui/empty-state';
import { Plus, Search, Users, Phone, Mail, MapPin, MoreVertical, Eye, Edit, Trash2, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { exportPartiesToExcel } from '@/lib/export-utils';

// Party form validation schema - aligned with backend CreatePartyDto
// REQUIRED: name, type only
// ALL OTHER FIELDS ARE OPTIONAL - validate format only if value provided
const partySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name too long'),
  type: z.enum(['customer', 'supplier', 'both']),
  // Optional fields - only validate format if non-empty
  gstin: z.string().optional().refine(
    (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    'Invalid GSTIN format (15 characters required)'
  ),
  pan: z.string().optional().refine(
    (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
    'Invalid PAN format (10 characters required)'
  ),
  email: z.string().optional().refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid email format'
  ),
  phone: z.string().optional().refine(
    (val) => !val || /^[6-9]\d{9}$/.test(val),
    'Invalid phone (10 digits starting with 6-9)'
  ),
  // Address fields - all optional
  billing_address_line1: z.string().optional(),
  billing_address_line2: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_pincode: z.string().optional().refine(
    (val) => !val || /^\d{6}$/.test(val),
    'Invalid pincode (6 digits required)'
  ),
  shipping_address_line1: z.string().optional(),
  shipping_address_line2: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_pincode: z.string().optional().refine(
    (val) => !val || /^\d{6}$/.test(val),
    'Invalid pincode (6 digits required)'
  ),
  // Financial fields - optional
  credit_limit: z.string().optional(),
  credit_period_days: z.string().optional(),
});

// Helper to clean payload - removes empty strings and undefined values
const cleanPayload = (data: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    // Only include non-empty values
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

type PartyFormValues = z.infer<typeof partySchema>;

interface Party {
  id: string;
  name: string;
  type: string;
  gstin?: string;
  phone?: string;
  email?: string;
  billing_city: string;
  billing_state: string;
  balance: number;
}

export default function PartiesPage() {
  const router = useRouter();
  const { isAuthenticated, businessId } = useAuthStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; party: Party | null; isDeleting: boolean }>({
    open: false,
    party: null,
    isDeleting: false,
  });
  const hasFetched = useRef(false);

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    mode: 'onBlur', // Only validate on blur, not on every keystroke
    defaultValues: {
      name: '',
      type: 'customer',
      gstin: '',
      pan: '',
      email: '',
      phone: '',
      billing_address_line1: '',
      billing_address_line2: '',
      billing_city: '',
      billing_state: '',
      billing_pincode: '',
      credit_limit: '',
      credit_period_days: '',
    },
  });

  const fetchParties = useCallback(async () => {
    try {
      const response = await partyApi.get('/parties');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setParties(data);
    } catch (error: any) {
      toast.error('Failed to load parties', {
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
      fetchParties();
    }
  }, [isAuthenticated, businessId, router, fetchParties]);

  const onSubmit = async (data: PartyFormValues) => {
    setIsSubmitting(true);
    try {
      // Build payload with only required and non-empty optional fields
      const rawPayload = {
        name: data.name,
        type: data.type,
        gstin: data.gstin,
        pan: data.pan,
        email: data.email,
        phone: data.phone,
        billing_address_line1: data.billing_address_line1,
        billing_address_line2: data.billing_address_line2,
        billing_city: data.billing_city,
        billing_state: data.billing_state,
        billing_pincode: data.billing_pincode,
        shipping_address_line1: data.shipping_address_line1,
        shipping_address_line2: data.shipping_address_line2,
        shipping_city: data.shipping_city,
        shipping_state: data.shipping_state,
        shipping_pincode: data.shipping_pincode,
        credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : undefined,
        credit_period_days: data.credit_period_days ? parseInt(data.credit_period_days) : undefined,
      };
      
      // Remove empty strings and undefined values
      const payload = cleanPayload(rawPayload);

      await partyApi.post('/parties', payload);
      toast.success('Party created successfully');
      setIsDialogOpen(false);
      form.reset();
      fetchParties();
    } catch (error: any) {
      toast.error('Failed to create party', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const partiesList = Array.isArray(parties) ? parties : [];

  // Memoize filtered parties to prevent recalculation on every render
  const filteredParties = useMemo(() => {
    return partiesList.filter((party) => {
      const matchesSearch = party.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.phone?.includes(searchQuery) ||
        party.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || party.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [partiesList, searchQuery, filterType]);

  // Memoize stats calculations to prevent recalculation on every render
  const stats = useMemo(() => {
    const totalCustomers = partiesList.filter(p => p.type === 'customer').length;
    const totalSuppliers = partiesList.filter(p => p.type === 'supplier').length;
    const totalReceivable = partiesList
      .filter(p => (p.balance || 0) > 0)
      .reduce((sum, p) => sum + Number(p.balance || 0), 0);
    const totalPayable = partiesList
      .filter(p => (p.balance || 0) < 0)
      .reduce((sum, p) => sum + Math.abs(Number(p.balance || 0)), 0);
    
    return {
      totalCustomers,
      totalSuppliers,
      totalReceivable,
      totalPayable,
    };
  }, [partiesList]);

  const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'customer': return 'default';
      case 'supplier': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Parties"
        description="Manage customers and suppliers"
        helpFeatureId={FEATURE_IDS.PARTIES_OVERVIEW}
      >
        <Button 
          variant="outline" 
          onClick={() => exportPartiesToExcel(partiesList as any)}
          disabled={partiesList.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>
                Enter party details. Customer or Supplier information.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Party Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} maxLength={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel>GSTIN</FormLabel>
                              <HelpTooltip
                                content="15-character GST Identification Number. Required for GST-compliant invoicing. Format: 22AAAAA0000A1Z5"
                                title="GSTIN"
                              />
                            </div>
                            <FormControl>
                              <Input placeholder="29ABCDE1234F1Z5" {...field} maxLength={15} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN</FormLabel>
                            <FormControl>
                              <Input placeholder="ABCDE1234F" {...field} maxLength={10} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Billing Address</h3>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="billing_address_line1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input placeholder="Street address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billing_address_line2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2</FormLabel>
                              <FormControl>
                                <Input placeholder="Landmark" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="billing_city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="billing_state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="billing_pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input placeholder="400001" {...field} maxLength={6} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Credit Terms</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="credit_limit"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>Credit Limit (₹)</FormLabel>
                                <HelpTooltip
                                  content="Maximum amount you'll allow this party to owe you on credit. The app will warn you if this limit is exceeded."
                                  title="Credit Limit"
                                />
                              </div>
                              <FormControl>
                                <Input type="number" placeholder="50000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="credit_period_days"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>Credit Days</FormLabel>
                                <HelpTooltip
                                  content="Number of days the party has to make payment. Used to calculate invoice due dates and track overdue payments."
                                  title="Credit Period"
                                />
                              </div>
                              <FormControl>
                                <Input type="number" placeholder="30" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                        {isSubmitting ? 'Creating...' : 'Create Party'}
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
                <div className="text-sm text-muted-foreground">Total Parties</div>
                <div className="text-2xl font-bold">{partiesList.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Customers</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">To Receive</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalReceivable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">To Pay</div>
                <div className="text-2xl font-bold text-red-600">
                  ₹{stats.totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parties by name, phone, or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : partiesList.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <NoPartiesEmpty onCreateClick={() => setIsDialogOpen(true)} />
              </CardContent>
            </Card>
          ) : filteredParties.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <NoSearchResultsEmpty query={searchQuery} onClearClick={() => setSearchQuery('')} />
              </CardContent>
            </Card>
          ) : (
            /* Parties List */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParties.map((party) => (
                <Card key={party.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/parties/${party.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          party.type === 'customer' ? 'bg-blue-100' :
                          party.type === 'supplier' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          <Users className={`h-5 w-5 ${
                            party.type === 'customer' ? 'text-blue-600' :
                            party.type === 'supplier' ? 'text-green-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{party.name}</CardTitle>
                          <Badge variant={getTypeVariant(party.type)} className="text-xs mt-1">
                            {(party.type || 'unknown').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/parties/${party.id}`); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/parties/${party.id}/edit`); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {party.phone && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${party.phone}`; }}>
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setDeleteDialog({ open: true, party, isDeleting: false });
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
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {party.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {party.phone}
                        </div>
                      )}
                      {party.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {party.email}
                        </div>
                      )}
                      {(party.billing_city || party.billing_state) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {party.billing_city || ''}{party.billing_city && party.billing_state ? ', ' : ''}{party.billing_state || ''}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      <span className={`font-semibold ${(party.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Math.abs(Number(party.balance || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        <span className="text-xs ml-1">{(party.balance || 0) >= 0 ? 'Dr' : 'Cr'}</span>
                      </span>
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
              if (!deleteDialog.party) return;
              setDeleteDialog({ ...deleteDialog, isDeleting: true });
              try {
                await partyApi.delete(`/parties/${deleteDialog.party.id}`);
                toast.success('Party deleted successfully');
                setDeleteDialog({ open: false, party: null, isDeleting: false });
                fetchParties();
              } catch (err: any) {
                toast.error('Failed to delete party', { 
                  description: err.response?.data?.message || 'Please try again' 
                });
                setDeleteDialog({ ...deleteDialog, isDeleting: false });
              }
            }}
            title="Delete Party"
            itemName={deleteDialog.party?.name}
            isDeleting={deleteDialog.isDeleting}
          />

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </AppLayout>
      );
    }
