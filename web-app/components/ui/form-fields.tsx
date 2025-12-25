'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  success,
  helperText,
  required,
  className,
  id,
  ...props
}: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={inputId}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            success && 'border-green-500 focus-visible:ring-green-500',
            (error || success) && 'pr-10',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
        {success && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive flex items-center gap-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

export function FormSelect({
  label,
  error,
  helperText,
  required,
  placeholder = 'Select an option',
  value,
  onValueChange,
  options,
  disabled,
}: FormSelectProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger 
          id={inputId}
          className={cn(error && 'border-destructive focus:ring-destructive')}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function FormTextarea({
  label,
  error,
  helperText,
  required,
  className,
  id,
  ...props
}: FormTextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={inputId}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Form section with title and description
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Validation status indicator
interface ValidationStatusProps {
  isValid: boolean;
  message: string;
}

export function ValidationStatus({ isValid, message }: ValidationStatusProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-sm',
      isValid ? 'text-green-600' : 'text-muted-foreground'
    )}>
      {isValid ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2" />
      )}
      <span>{message}</span>
    </div>
  );
}
