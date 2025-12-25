/**
 * Notification Service
 * 
 * Provides utilities for managing and formatting notifications
 */

import { Notification } from '@/lib/hooks/use-notifications';

/**
 * Format notification message based on type
 */
export function formatNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case 'invoice_overdue':
      return notification.message;
    
    case 'low_stock':
      const itemCount = notification.metadata?.itemCount;
      if (typeof itemCount === 'number' && itemCount > 1) {
        return `${itemCount} items are running low on stock`;
      }
      return notification.message;
    
    case 'payment_received':
      return notification.message;
    
    case 'invoice_created':
      return notification.message;
    
    default:
      return notification.message;
  }
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(notification: Notification): string {
  switch (notification.type) {
    case 'invoice_overdue':
      return '⚠️';
    case 'low_stock':
      return '📦';
    case 'payment_received':
      return '💰';
    case 'invoice_created':
      return '📄';
    default:
      return '🔔';
  }
}

/**
 * Get notification color/variant based on type
 */
export function getNotificationVariant(notification: Notification): 'default' | 'destructive' | 'warning' | 'success' {
  switch (notification.type) {
    case 'invoice_overdue':
      return 'destructive';
    case 'low_stock':
      return 'warning';
    case 'payment_received':
      return 'success';
    case 'invoice_created':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Group notifications by type
 */
export function groupNotificationsByType(notifications: Notification[]): Record<string, Notification[]> {
  return notifications.reduce((acc, notification) => {
    const type = notification.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);
}

/**
 * Filter notifications by type
 */
export function filterNotificationsByType(
  notifications: Notification[],
  type: Notification['type']
): Notification[] {
  return notifications.filter(n => n.type === type);
}

/**
 * Get notification count by type
 */
export function getNotificationCountByType(notifications: Notification[]): Record<string, number> {
  return notifications.reduce((acc, notification) => {
    const type = notification.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

