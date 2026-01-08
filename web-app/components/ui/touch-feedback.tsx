'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Provides visual feedback for touch interactions on mobile devices
 */
export function TouchFeedback({ children, className, disabled }: TouchFeedbackProps) {
  return (
    <div
      className={cn(
        'active:scale-95 transition-transform duration-150',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  );
}


