"use client";

import * as React from "react";
import { Download, FileText, FileSpreadsheet, FileJson, Code, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'markdown';

interface ExportButtonProps {
  /** Function to handle PDF export */
  onExportPDF?: () => void | Promise<void>;
  /** Function to handle Excel export */
  onExportExcel?: () => void | Promise<void>;
  /** Function to handle CSV export */
  onExportCSV?: () => void | Promise<void>;
  /** Function to handle JSON export */
  onExportJSON?: () => void | Promise<void>;
  /** Function to handle Markdown export */
  onExportMarkdown?: () => void | Promise<void>;
  /** Custom filename for exports */
  filename?: string;
  /** Show only specific formats */
  formats?: ExportFormat[];
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional className */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

const formatLabels: Record<ExportFormat, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  pdf: { label: 'Export as PDF', icon: FileText },
  excel: { label: 'Export as Excel', icon: FileSpreadsheet },
  csv: { label: 'Export as CSV', icon: FileText },
  json: { label: 'Export as JSON', icon: Code },
  markdown: { label: 'Export as Markdown', icon: FileText },
};

export function ExportButton({
  onExportPDF,
  onExportExcel,
  onExportCSV,
  onExportJSON,
  onExportMarkdown,
  filename,
  formats = ['pdf', 'excel', 'csv', 'json', 'markdown'],
  variant = 'outline',
  size = 'default',
  className,
  isLoading = false,
  disabled = false,
}: ExportButtonProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = React.useState<ExportFormat | null>(null);

  const handleExport = async (
    format: ExportFormat,
    handler?: () => void | Promise<void>
  ) => {
    if (!handler || disabled || isLoading) return;

    try {
      setExporting(format);
      await handler();
      
      toast({
        title: "Export Successful",
        description: `${filename || 'File'} exported as ${format.toUpperCase()}`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export file",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const availableFormats = formats.filter(format => {
    switch (format) {
      case 'pdf':
        return !!onExportPDF;
      case 'excel':
        return !!onExportExcel;
      case 'csv':
        return !!onExportCSV;
      case 'json':
        return !!onExportJSON;
      case 'markdown':
        return !!onExportMarkdown;
      default:
        return false;
    }
  });

  // If only one format is available, show as regular button
  if (availableFormats.length === 1) {
    const format = availableFormats[0];
    const { label, icon: Icon } = formatLabels[format];
    const handler = 
      format === 'pdf' ? onExportPDF :
      format === 'excel' ? onExportExcel :
      format === 'csv' ? onExportCSV :
      format === 'json' ? onExportJSON :
      onExportMarkdown;

    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => handleExport(format, handler)}
        disabled={disabled || isLoading || !!exporting}
      >
        {exporting === format ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </>
        )}
      </Button>
    );
  }

  // Multiple formats - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(className)}
          disabled={disabled || isLoading || !!exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableFormats.includes('pdf') && onExportPDF && (
          <DropdownMenuItem
            onClick={() => handleExport('pdf', onExportPDF)}
            disabled={!!exporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>PDF</span>
          </DropdownMenuItem>
        )}
        
        {availableFormats.includes('excel') && onExportExcel && (
          <DropdownMenuItem
            onClick={() => handleExport('excel', onExportExcel)}
            disabled={!!exporting}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span>Excel</span>
          </DropdownMenuItem>
        )}
        
        {availableFormats.includes('csv') && onExportCSV && (
          <DropdownMenuItem
            onClick={() => handleExport('csv', onExportCSV)}
            disabled={!!exporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>CSV</span>
          </DropdownMenuItem>
        )}
        
        {availableFormats.includes('json') && onExportJSON && (
          <DropdownMenuItem
            onClick={() => handleExport('json', onExportJSON)}
            disabled={!!exporting}
          >
            <Code className="h-4 w-4 mr-2" />
            <span>JSON</span>
          </DropdownMenuItem>
        )}
        
        {availableFormats.includes('markdown') && onExportMarkdown && (
          <DropdownMenuItem
            onClick={() => handleExport('markdown', onExportMarkdown)}
            disabled={!!exporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>Markdown</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


