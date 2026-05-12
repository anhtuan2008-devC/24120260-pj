import { useEffect, useRef } from 'react';
import { AlertTriangleIcon } from './icons';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isBusy = false,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* Auto-focus Cancel button when opening */
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  /* Keyboard: Escape to close, Tab to trap focus between Cancel and Confirm */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
        onCancel();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        // Toggle focus between Cancel and Confirm
        if (document.activeElement === cancelRef.current) {
          confirmRef.current?.focus();
        } else {
          cancelRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBusy, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={isBusy ? undefined : onCancel}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <AlertTriangleIcon size={28} />
          </div>
          <h3 className="modal-title" id="modal-title">{title}</h3>
        </div>
        <div className="modal-body" id="modal-desc">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button
            ref={cancelRef}
            type="button"
            className="modal-btn cancel"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="modal-btn danger"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
