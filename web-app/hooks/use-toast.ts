"use client";

import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  icon?: ReactNode;
}

export function useToast() {
  return {
    toast: ({ title, description, variant, icon }: ToastProps) => {
      if (variant === "destructive") {
        sonnerToast.error(title, { description });
      } else {
        sonnerToast.success(title, { description });
      }
    },
  };
}

