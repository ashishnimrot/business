'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HelpCenter } from '@/components/ui/help-center';
import { DocumentationService, FEATURE_IDS } from '@/lib/services/documentation.service';

interface ModuleHelpProps {
  featureId: string;
  variant?: 'button' | 'icon' | 'link';
  className?: string;
}

/**
 * ModuleHelp Component
 * 
 * Provides quick access to help documentation for a specific module/feature.
 * Can be used as a button, icon, or link.
 */
export function ModuleHelp({ featureId, variant = 'icon', className }: ModuleHelpProps) {
  const [open, setOpen] = React.useState(false);
  const doc = DocumentationService.getById(featureId);

  if (!doc) return null;

  const content = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {variant === 'button' ? (
          <Button variant="outline" size="sm" className={className}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        ) : variant === 'link' ? (
          <Button variant="link" size="sm" className={className}>
            <HelpCircle className="h-4 w-4 mr-1" />
            View Help
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className={className} title="Help">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <HelpCenter 
          onClose={() => setOpen(false)} 
          initialFeatureId={featureId}
        />
      </SheetContent>
    </Sheet>
  );

  return content;
}

/**
 * QuickHelpLink Component
 * 
 * A simple link to open help for a specific feature
 */
export function QuickHelpLink({ 
  featureId, 
  children, 
  className 
}: { 
  featureId: string; 
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          type="button"
          className={className || "text-primary hover:underline text-sm flex items-center gap-1"}
        >
          {children}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <HelpCenter 
          onClose={() => setOpen(false)} 
          initialFeatureId={featureId}
        />
      </SheetContent>
    </Sheet>
  );
}

