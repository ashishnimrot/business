'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skip to main content link for screen readers
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-ring'
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Visually hidden but accessible to screen readers
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  className,
  ...props
}: {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn('sr-only', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref]);
}

