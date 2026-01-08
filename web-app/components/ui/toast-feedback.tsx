'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toastFeedback = {
  success: ({ title, description, duration = 3000, action }: ToastOptions) => {
    return toast.success(title, {
      description,
      duration,
      action,
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  },
  
  error: ({ title, description, duration = 5000, action }: ToastOptions) => {
    return toast.error(title, {
      description,
      duration,
      action,
      icon: <XCircle className="h-5 w-5" />,
    });
  },
  
  warning: ({ title, description, duration = 4000, action }: ToastOptions) => {
    return toast.warning(title, {
      description,
      duration,
      action,
      icon: <AlertCircle className="h-5 w-5" />,
    });
  },
  
  info: ({ title, description, duration = 3000, action }: ToastOptions) => {
    return toast.info(title, {
      description,
      duration,
      action,
      icon: <Info className="h-5 w-5" />,
    });
  },
};


