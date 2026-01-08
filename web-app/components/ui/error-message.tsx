'use client';

import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'banner';
}

export function ErrorMessage({
  title = 'Error',
  message,
  onDismiss,
  onRetry,
  className,
  variant = 'default',
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-start gap-2 text-sm text-destructive', className)}>
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4',
          className
        )}
      >
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-destructive">{title}</p>
          <p className="text-sm text-destructive/80">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/50 bg-destructive/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-destructive mb-1">{title}</h3>
          <p className="text-sm text-destructive/80">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}


