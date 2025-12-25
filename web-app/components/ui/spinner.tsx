'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
    </div>
  );
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingOverlay({ className, message = 'Loading...', ...props }: LoadingOverlayProps) {
  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )} 
      {...props}
    >
      <Spinner size="xl" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface LoadingButtonContentProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButtonContent({ isLoading, loadingText, children }: LoadingButtonContentProps) {
  if (isLoading) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText || 'Loading...'}
      </>
    );
  }
  return <>{children}</>;
}

interface InlineLoadingProps {
  className?: string;
  text?: string;
}

export function InlineLoading({ className, text = 'Loading...' }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}
