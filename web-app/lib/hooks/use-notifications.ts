/**
 * Notifications Hook
 * 
 * Fetches real-time notifications from various API sources:
 * - Overdue invoices
 * - Low stock alerts
 * - Recent payments
 * - New invoices (optional)
 */

import { useQuery } from '@tanstack/react-query';
import { invoiceApi, inventoryApi, paymentApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';

export interface Notification {
  id: string;
  type: 'invoice_overdue' | 'low_stock' | 'payment_received' | 'invoice_created';
  title: string;
  message: string;
  timestamp: Date;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Fetch overdue invoices
 */
async function fetchOverdueInvoices(businessId: string | null): Promise<Notification[]> {
  if (!businessId) return [];

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await invoiceApi.get('/invoices', {
      params: {
        paymentStatus: 'unpaid',
        status: 'draft',
        // Note: Backend should support dueDate filter
        // For now, we'll filter client-side
      },
    });

    const invoices = response.data?.invoices || 
                     (Array.isArray(response.data) ? response.data : (response.data?.data || []));

    // Filter overdue invoices (due date < today)
    const overdue = invoices.filter((inv: any) => {
      if (!inv.due_date) return false;
      const dueDate = new Date(inv.due_date);
      const todayDate = new Date(today);
      return dueDate < todayDate;
    });

    return overdue.map((inv: any) => ({
      id: `invoice-overdue-${inv.id}`,
      type: 'invoice_overdue' as const,
      title: `Invoice #${inv.invoice_number} is overdue`,
      message: `Payment was due ${Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      timestamp: new Date(inv.due_date),
      link: `/invoices/${inv.id}`,
      metadata: {
        invoiceId: inv.id,
        invoiceNumber: inv.invoice_number,
        amount: inv.total_amount,
        daysOverdue: Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)),
      },
    }));
  } catch (error) {
    console.error('Failed to fetch overdue invoices:', error);
    return [];
  }
}

/**
 * Fetch low stock items
 */
async function fetchLowStockItems(businessId: string | null): Promise<Notification[]> {
  if (!businessId) return [];

  try {
    const response = await inventoryApi.get('/items/low-stock');
    const items = response.data?.items || 
                  (Array.isArray(response.data) ? response.data : (response.data?.data || []));

    if (items.length === 0) return [];

    // Group low stock items into a single notification if multiple
    if (items.length === 1) {
      const item = items[0];
      return [{
        id: `low-stock-${item.id}`,
        type: 'low_stock' as const,
        title: 'Low stock alert',
        message: `${item.name} is running low (${item.current_stock} remaining)`,
        timestamp: new Date(),
        link: `/inventory?itemId=${item.id}`,
        metadata: {
          itemId: item.id,
          itemName: item.name,
          currentStock: item.current_stock,
          threshold: item.low_stock_threshold,
        },
      }];
    }

    // Multiple items - create summary notification
    return [{
      id: 'low-stock-multiple',
      type: 'low_stock' as const,
      title: 'Low stock alert',
      message: `${items.length} items are running low on stock`,
      timestamp: new Date(),
      link: '/inventory?filter=low-stock',
      metadata: {
        itemCount: items.length,
        items: items.map((item: any) => ({
          id: item.id,
          name: item.name,
          stock: item.current_stock,
        })),
      },
    }];
  } catch (error) {
    console.error('Failed to fetch low stock items:', error);
    return [];
  }
}

/**
 * Fetch recent payments
 */
async function fetchRecentPayments(businessId: string | null): Promise<Notification[]> {
  if (!businessId) return [];

  try {
    const response = await paymentApi.get('/payments', {
      params: {
        limit: 5,
        // Note: Backend should support sorting
        // For now, we'll get recent payments
      },
    });

    const payments = response.data?.payments || 
                     (Array.isArray(response.data) ? response.data : (response.data?.data || []));

    // Get payments from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recent = payments.filter((payment: any) => {
      const paymentDate = new Date(payment.payment_date || payment.created_at);
      return paymentDate > oneDayAgo;
    });

    return recent.map((payment: any) => ({
      id: `payment-${payment.id}`,
      type: 'payment_received' as const,
      title: 'New payment received',
      message: `₹${Number(payment.amount || 0).toLocaleString('en-IN')} from ${payment.party?.name || 'Customer'}`,
      timestamp: new Date(payment.payment_date || payment.created_at),
      link: `/payments/${payment.id}`,
      metadata: {
        paymentId: payment.id,
        amount: payment.amount,
        partyName: payment.party?.name,
        paymentMode: payment.payment_mode,
      },
    }));
  } catch (error) {
    console.error('Failed to fetch recent payments:', error);
    return [];
  }
}

/**
 * Aggregate all notifications
 */
async function fetchAllNotifications(businessId: string | null): Promise<NotificationData> {
  const [overdue, lowStock, payments] = await Promise.all([
    fetchOverdueInvoices(businessId),
    fetchLowStockItems(businessId),
    fetchRecentPayments(businessId),
  ]);

  // Combine and sort by timestamp (newest first)
  const allNotifications = [...overdue, ...lowStock, ...payments].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return {
    notifications: allNotifications,
    unreadCount: allNotifications.length, // For now, all are unread
  };
}

/**
 * Hook to fetch and manage notifications
 */
export function useNotifications() {
  const { businessId } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery<NotificationData>({
    queryKey: ['notifications', businessId],
    queryFn: () => fetchAllNotifications(businessId),
    enabled: !!businessId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    refetch,
  };
}

