import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType, ToastType as ToastTypeEnum } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastConfig: Record<ToastTypeEnum, {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  progressColor: string;
}> = {
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    progressColor: 'bg-green-500'
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    progressColor: 'bg-red-500'
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    progressColor: 'bg-amber-500'
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    progressColor: 'bg-blue-500'
  }
};

function ToastItem({ toast, onRemove }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const duration = toast.duration || 5000;
  const config = toastConfig[toast.type];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Wait for exit animation
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        hover:shadow-xl hover:scale-[1.02]
        min-w-[320px] max-w-[400px]
      `}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 ${config.textColor}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor} leading-relaxed`}>
            {toast.message}
          </p>
        </div>

        <button
          onClick={handleRemove}
          className={`
            flex-shrink-0 p-1 rounded-full transition-colors
            hover:bg-black/5 active:bg-black/10
            ${config.textColor} opacity-60 hover:opacity-100
          `}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div
          className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

export default ToastContainer;
