'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Circle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'active' | 'inactive'
  | 'paid' | 'unpaid' | 'partial' | 'overdue' | 'cancelled' | 'completed' | 'draft';

interface StatusBadgeProps {
  status: StatusType | string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<string, {
  variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default' | 'outline';
  icon: React.ElementType;
  label: string;
}> = {
  success: { variant: 'success', icon: CheckCircle, label: 'Success' },
  completed: { variant: 'success', icon: CheckCircle, label: 'Completed' },
  paid: { variant: 'success', icon: CheckCircle, label: 'Paid' },
  active: { variant: 'success', icon: CheckCircle, label: 'Active' },
  
  warning: { variant: 'warning', icon: AlertCircle, label: 'Warning' },
  pending: { variant: 'warning', icon: Clock, label: 'Pending' },
  partial: { variant: 'warning', icon: Circle, label: 'Partial' },
  unpaid: { variant: 'warning', icon: Clock, label: 'Unpaid' },
  
  error: { variant: 'destructive', icon: XCircle, label: 'Error' },
  cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
  overdue: { variant: 'destructive', icon: AlertCircle, label: 'Overdue' },
  
  info: { variant: 'info', icon: AlertCircle, label: 'Info' },
  draft: { variant: 'secondary', icon: Circle, label: 'Draft' },
  
  inactive: { variant: 'outline', icon: Circle, label: 'Inactive' },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    variant: 'secondary' as const,
    icon: Circle,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };
  
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

// Payment status badge
interface PaymentStatusBadgeProps {
  totalAmount: number;
  paidAmount: number;
  className?: string;
}

export function PaymentStatusBadge({ totalAmount, paidAmount, className }: PaymentStatusBadgeProps) {
  let status: StatusType = 'unpaid';
  
  if (paidAmount >= totalAmount) {
    status = 'paid';
  } else if (paidAmount > 0) {
    status = 'partial';
  }
  
  return <StatusBadge status={status} className={className} />;
}

// Invoice status badge with auto-calculation
interface InvoiceStatusBadgeProps {
  status: string;
  dueDate?: string;
  className?: string;
}

export function InvoiceStatusBadge({ status, dueDate, className }: InvoiceStatusBadgeProps) {
  // Check for overdue
  if (status === 'pending' && dueDate) {
    const due = new Date(dueDate);
    if (due < new Date()) {
      return <StatusBadge status="overdue" className={className} />;
    }
  }
  
  return <StatusBadge status={status} className={className} />;
}

// Stock status badge
interface StockStatusBadgeProps {
  quantity: number;
  minLevel?: number;
  className?: string;
}

export function StockStatusBadge({ quantity, minLevel = 10, className }: StockStatusBadgeProps) {
  let status: StatusType = 'active';
  let label = 'In Stock';
  
  if (quantity <= 0) {
    status = 'error';
    label = 'Out of Stock';
  } else if (quantity <= minLevel) {
    status = 'warning';
    label = 'Low Stock';
  }
  
  return (
    <Badge 
      variant={status === 'error' ? 'destructive' : status === 'warning' ? 'warning' : 'success'} 
      className={className}
    >
      {label}
    </Badge>
  );
}

// Loading badge
export function LoadingBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn('gap-1', className)}>
      <Loader2 className="h-3 w-3 animate-spin" />
      Loading
    </Badge>
  );
}
