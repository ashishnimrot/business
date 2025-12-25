'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  error,
  title = 'Something went wrong',
  description,
  onRetry,
}: ErrorDisplayProps) {
  const errorMessage = description || error?.message || 'An unexpected error occurred. Please try again.';
  
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg text-destructive">{title}</CardTitle>
        </div>
        <CardDescription className="text-destructive/80">{errorMessage}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-destructive ${className || ''}`}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

interface ApiErrorProps {
  error: any;
  onRetry?: () => void;
}

export function ApiError({ error, onRetry }: ApiErrorProps) {
  const message = error?.response?.data?.message || error?.message || 'An error occurred';
  const status = error?.response?.status;
  
  let title = 'Error';
  if (status === 401) title = 'Unauthorized';
  else if (status === 403) title = 'Access Denied';
  else if (status === 404) title = 'Not Found';
  else if (status === 500) title = 'Server Error';
  else if (status >= 400 && status < 500) title = 'Request Error';
  
  return <ErrorDisplay title={title} description={message} onRetry={onRetry} />;
}
