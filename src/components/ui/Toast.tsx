import { useEffect, useState } from 'react';
import { CircleCheckIcon, CircleXIcon, InfoIcon } from './icons';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

const TOAST_DURATION_MS = 3500;

function ToastItem({ toast, removeToast }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
    }, TOAST_DURATION_MS);

    return () => clearTimeout(dismissTimer);
  }, []);

  /* Xóa khỏi DOM sau khi exit animation kết thúc */
  const handleAnimationEnd = () => {
    if (isExiting) {
      removeToast(toast.id);
    }
  };

  const handleManualClose = () => {
    setIsExiting(true);
  };

  return (
    <div
      className={`toast-item toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="toast-icon-wrapper">
        {toast.type === 'success' && <CircleCheckIcon size={20} />}
        {toast.type === 'error' && <CircleXIcon size={20} />}
        {toast.type === 'info' && <InfoIcon size={20} />}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={handleManualClose}>
        ×
      </button>
      {/* Progress bar (auto-shrink) */}
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
        />
      </div>
    </div>
  );
}
