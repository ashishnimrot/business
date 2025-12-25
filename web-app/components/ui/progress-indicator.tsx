'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ProgressIndicator({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  variant = 'default',
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

