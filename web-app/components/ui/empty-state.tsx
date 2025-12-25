'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Search,
  Plus,
  FolderOpen,
  ShoppingCart,
  Inbox,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoInvoicesEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No invoices yet"
      description="Create your first invoice to start tracking your sales and generating GST-compliant documents."
      action={{ label: "Create Invoice", onClick: onCreateClick }}
    />
  );
}

export function NoPartiesEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No parties yet"
      description="Add customers and suppliers to start managing your business relationships and track payments."
      action={{ label: "Add Party", onClick: onCreateClick }}
    />
  );
}

export function NoItemsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No items yet"
      description="Add products or services to your inventory to include them in invoices and track stock."
      action={{ label: "Add Item", onClick: onCreateClick }}
    />
  );
}

export function NoPaymentsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={CreditCard}
      title="No payments yet"
      description="Record payments received from customers or made to suppliers to keep your books accurate."
      action={{ label: "Record Payment", onClick: onCreateClick }}
    />
  );
}

export function NoReportsDataEmpty() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No data for reports"
      description="Start creating invoices and recording transactions to see insights and analytics here."
    />
  );
}

export function NoSearchResultsEmpty({ query, onClearClick }: { query: string; onClearClick: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={{ label: "Clear Search", onClick: onClearClick }}
    />
  );
}

export function NoOrdersEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="No orders yet"
      description="Create purchase or sales orders to manage your business transactions."
      action={{ label: "Create Order", onClick: onCreateClick }}
    />
  );
}

export function InboxEmpty() {
  return (
    <EmptyState
      icon={Inbox}
      title="All caught up!"
      description="You have no pending notifications or tasks at the moment."
    />
  );
}
