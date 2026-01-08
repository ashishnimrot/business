"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrintButtonProps {
  /** Custom print handler */
  onPrint?: () => void;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Print CSS selector to target */
  printSelector?: string;
}

export function PrintButton({
  onPrint,
  variant = 'outline',
  size = 'default',
  className,
  disabled = false,
  printSelector,
}: PrintButtonProps) {
  const handlePrint = React.useCallback(() => {
    if (onPrint) {
      onPrint();
      return;
    }

    // Default print behavior
    const elementToPrint = printSelector 
      ? document.querySelector(printSelector)
      : document.body;

    if (!elementToPrint) {
      window.print();
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback to regular print if popup blocked
      window.print();
      return;
    }

    // Get the HTML content
    const htmlContent = elementToPrint.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    // Write to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          <style>
            ${styles}
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
              @page { size: A4; margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      // Close window after printing (optional)
      // printWindow.close();
    }, 250);
  }, [onPrint, printSelector]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handlePrint}
      disabled={disabled}
      aria-label="Print this page"
    >
      <Printer className="h-4 w-4 mr-2" />
      Print
    </Button>
  );
}


