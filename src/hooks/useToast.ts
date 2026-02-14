import { useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let globalAddToast: ((message: string, type: ToastType, duration?: number) => void) | null = null;

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] });
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setState(prev => ({
      toasts: prev.toasts.filter(t => t.id !== id)
    }));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}-${toastIdRef.current++}`;
    
    setState(prev => ({
      toasts: [...prev.toasts, { id, message, type, duration }]
    }));

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);


  const success = useCallback((message: string, duration?: number) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Set global addToast for use outside React components
  useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}

// Global function to show toast from anywhere (including outside React)
export function showToast(message: string, type: ToastType = 'info', duration = 5000) {

  if (globalAddToast) {
    globalAddToast(message, type, duration);
  } else {
    console.warn('Toast system not initialized yet');
  }
}

export function showSuccess(message: string, duration?: number) {
  showToast(message, 'success', duration);
}

export function showError(message: string, duration?: number) {
  showToast(message, 'error', duration);
}

export function showWarning(message: string, duration?: number) {
  showToast(message, 'warning', duration);
}

export function showInfo(message: string, duration?: number) {
  showToast(message, 'info', duration);
}
