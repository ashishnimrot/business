'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModuleHelp } from '@/components/ui/module-help';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  helpFeatureId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  helpFeatureId,
  children,
  className,
}: PageHeaderProps) {
  const ActionIcon = action?.icon || Plus;
  
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", className)}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {helpFeatureId && (
            <ModuleHelp featureId={helpFeatureId} variant="icon" />
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {helpFeatureId && (
          <ModuleHelp featureId={helpFeatureId} variant="button" className="hidden sm:flex" />
        )}
        {action && (
          <Button onClick={action.onClick}>
            <ActionIcon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
