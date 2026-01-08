'use client';

import * as React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface SuccessMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'banner';
}

export function SuccessMessage({
  title = 'Success',
  message,
  onDismiss,
  className,
  variant = 'default',
}: SuccessMessageProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-start gap-2 text-sm text-green-600 dark:text-green-400', className)}>
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4',
          className
        )}
      >
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-green-600 dark:text-green-400">{title}</p>
          <p className="text-sm text-green-600/80 dark:text-green-400/80">{message}</p>
        </div>
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
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-green-500/50 bg-green-500/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-green-600 dark:text-green-400 mb-1">{title}</h3>
          <p className="text-sm text-green-600/80 dark:text-green-400/80">{message}</p>
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


