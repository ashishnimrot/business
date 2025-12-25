import { toast } from 'sonner';
import {
  parseApiError,
  getUserFriendlyMessage,
  ErrorCategory,
  type ApiErrorResponse,
} from './error-handler';

// Success notifications
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showCreatedSuccess = (entity: string) => {
  toast.success(`${entity} created`, { description: `${entity} has been created successfully.` });
};

export const showUpdatedSuccess = (entity: string) => {
  toast.success(`${entity} updated`, { description: `${entity} has been updated successfully.` });
};

export const showDeletedSuccess = (entity: string) => {
  toast.success(`${entity} deleted`, { description: `${entity} has been deleted successfully.` });
};

// Error notifications
export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showApiError = (error: unknown, fallbackMessage = 'An error occurred', onRetry?: () => void) => {
  const parsedError = parseApiError(error);
  const friendlyMessage = getUserFriendlyMessage(parsedError);
  
  // Create action button for retryable errors
  const toastOptions: Parameters<typeof toast.error>[1] = {
    description: friendlyMessage.description,
    duration: parsedError.retryable ? 10000 : 5000, // Longer duration for retryable errors
  };

  // Add action for retryable errors
  if (onRetry && (parsedError.retryable || friendlyMessage.actionLabel)) {
    toastOptions.action = {
      label: friendlyMessage.actionLabel || 'Retry',
      onClick: () => {
        if (friendlyMessage.actionCallback) {
          friendlyMessage.actionCallback();
        } else {
          onRetry();
        }
      },
    };
  }

  toast.error(friendlyMessage.title, toastOptions);
  
  return parsedError;
};

// Enhanced error display with validation details
export const showValidationErrors = (error: unknown) => {
  const parsedError = parseApiError(error);
  
  if (parsedError.category === ErrorCategory.VALIDATION && parsedError.details?.validationErrors) {
    const validationErrors = parsedError.details.validationErrors as Array<{ field: string; message: string }>;
    
    // Group similar errors
    const errorMessages = validationErrors.map(e => `• ${e.field}: ${e.message}`).join('\n');
    
    toast.error('Validation Failed', {
      description: errorMessages,
      duration: 8000,
    });
  } else {
    showApiError(error);
  }
  
  return parsedError;
};

export const showValidationError = (message = 'Please check the form for errors') => {
  toast.error('Validation Error', { description: message });
};

export const showNetworkError = (onRetry?: () => void) => {
  const toastOptions: Parameters<typeof toast.error>[1] = {
    description: 'Please check your internet connection and try again.',
    duration: 10000,
  };

  if (onRetry) {
    toastOptions.action = {
      label: 'Retry',
      onClick: onRetry,
    };
  }

  toast.error('Network Error', toastOptions);
};

export const showServerError = (onRetry?: () => void) => {
  const toastOptions: Parameters<typeof toast.error>[1] = {
    description: 'Something went wrong on our end. Please try again later.',
    duration: 8000,
  };

  if (onRetry) {
    toastOptions.action = {
      label: 'Retry',
      onClick: onRetry,
    };
  }

  toast.error('Server Error', toastOptions);
};

export const showTimeoutError = (onRetry?: () => void) => {
  const toastOptions: Parameters<typeof toast.error>[1] = {
    description: 'The request took too long. Please try again.',
    duration: 8000,
  };

  if (onRetry) {
    toastOptions.action = {
      label: 'Retry',
      onClick: onRetry,
    };
  }

  toast.error('Request Timeout', toastOptions);
};

export const showAuthError = () => {
  toast.error('Session Expired', {
    description: 'Please log in again to continue.',
    action: {
      label: 'Log In',
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    },
  });
};

// Info & Warning notifications
export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

// Loading notifications (returns dismiss function)
export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

// Promise-based notifications
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
): Promise<T> => {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
  return promise;
};

// Common action patterns with enhanced error handling
export const notifyAction = {
  create: async <T,>(entity: string, action: () => Promise<T>, onError?: () => void): Promise<T> => {
    try {
      const result = await action();
      toast.success(`${entity} created`, {
        description: `${entity} has been created successfully.`,
      });
      return result;
    } catch (error) {
      showApiError(error, `Failed to create ${entity}`, onError);
      throw error;
    }
  },
  
  update: async <T,>(entity: string, action: () => Promise<T>, onError?: () => void): Promise<T> => {
    try {
      const result = await action();
      toast.success(`${entity} updated`, {
        description: `${entity} has been updated successfully.`,
      });
      return result;
    } catch (error) {
      showApiError(error, `Failed to update ${entity}`, onError);
      throw error;
    }
  },
  
  delete: async <T,>(entity: string, action: () => Promise<T>, onError?: () => void): Promise<T> => {
    try {
      const result = await action();
      toast.success(`${entity} deleted`, {
        description: `${entity} has been deleted successfully.`,
      });
      return result;
    } catch (error) {
      showApiError(error, `Failed to delete ${entity}`, onError);
      throw error;
    }
  },
  
  fetch: async <T,>(entity: string, action: () => Promise<T>, onError?: () => void): Promise<T> => {
    try {
      const result = await action();
      return result;
    } catch (error) {
      showApiError(error, `Failed to load ${entity}`, onError);
      throw error;
    }
  },
};

// Export error categories for use in components
export { ErrorCategory } from './error-handler';
