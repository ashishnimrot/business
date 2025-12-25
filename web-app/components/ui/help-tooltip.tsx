'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  title?: string;
  variant?: 'default' | 'icon' | 'text';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  children?: React.ReactNode;
}

/**
 * HelpTooltip Component
 * 
 * Provides contextual help tooltips for features, buttons, and sections.
 * Can be used as an icon, text link, or wrapped around any element.
 * 
 * @example
 * // Icon variant (default)
 * <HelpTooltip content="This feature helps you manage customers" />
 * 
 * // Text variant
 * <HelpTooltip content="Learn more about parties" variant="text">
 *   What are parties?
 * </HelpTooltip>
 * 
 * // Wrapped variant
 * <HelpTooltip content="Click to add a new party">
 *   <Button>Add Party</Button>
 * </HelpTooltip>
 */
export function HelpTooltip({
  content,
  title,
  variant = 'icon',
  side = 'top',
  className,
  children,
}: HelpTooltipProps) {
  if (variant === 'text' && children) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'text-primary hover:text-primary/80 underline underline-offset-2 text-sm',
              className
            )}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (children) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center',
            variant === 'icon' && 'text-muted-foreground hover:text-foreground',
            className
          )}
          aria-label="Help"
        >
          {variant === 'icon' ? (
            <HelpCircle className="h-4 w-4" />
          ) : (
            <HelpCircle className="h-4 w-4 mr-1" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{content}</div>
      </TooltipContent>
    </Tooltip>
  );
}

