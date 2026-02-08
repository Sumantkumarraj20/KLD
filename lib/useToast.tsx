import { useState, useCallback, useRef, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface UseToastReturn {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const BG_COLORS: Record<ToastType, string> = {
  success: 'bg-success-50 border-l-4 border-success-600',
  error: 'bg-danger-50 border-l-4 border-danger-600',
  warning: 'bg-warning-50 border-l-4 border-warning-600',
  info: 'bg-primary-50 border-l-4 border-primary-600',
};

const TEXT_COLORS: Record<ToastType, string> = {
  success: 'text-success-800',
  error: 'text-danger-800',
  warning: 'text-warning-800',
  info: 'text-primary-800',
};

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = timeoutRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);

      timeoutRef.current.set(id, timeout);
    },
    [removeToast]
  );

  const clearToasts = useCallback(() => {
    toasts.forEach((toast) => removeToast(toast.id));
  }, [toasts, removeToast]);

  return { toasts, showToast, removeToast, clearToasts };
};

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-up pointer-events-auto cursor-pointer transition-all transform hover:shadow-xl`}
          style={{
            background: toast.type === 'success' ? '#ecfdf5' : 
                       toast.type === 'error' ? '#fef2f2' : 
                       toast.type === 'warning' ? '#fffbeb' : 
                       '#eff6ff',
            borderLeft: `4px solid ${
              toast.type === 'success' ? '#16a34a' : 
              toast.type === 'error' ? '#dc2626' : 
              toast.type === 'warning' ? '#ea580c' : 
              '#2563eb'
            }`,
          }}
          onClick={() => onRemove(toast.id)}
        >
          <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[toast.type]}</span>
          <p className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(toast.id);
            }}
            className="text-xl flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
