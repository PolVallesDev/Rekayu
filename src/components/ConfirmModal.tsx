import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-calma-surface border border-calma-line shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-calma-muted hover:text-calma-ink hover:bg-calma-bg transition-colors cursor-pointer"
          aria-label="Cerrar diálogo"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-2.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-none ${
              isDanger
                ? 'bg-calma-warn/15 text-calma-warn'
                : 'bg-calma-accent/15 text-calma-accent'
            }`}
          >
            {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <h3 className="font-serif text-[20px] text-calma-ink font-normal leading-tight m-0">
            {title}
          </h3>
        </div>

        {message && (
          <p className="text-[13.5px] text-calma-muted leading-relaxed mb-6 m-0">
            {message}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-calma-muted hover:text-calma-ink hover:bg-calma-bg border border-calma-line transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all shadow-xs cursor-pointer ${
              isDanger
                ? 'bg-calma-warn text-white hover:opacity-90'
                : 'bg-calma-accent text-white hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
