import { X } from 'lucide-react';
import { cn } from '../utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-bg-secondary border border-border-default shadow-card w-full mx-4 animate-fade-in',
        sizeClasses[size]
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-bg-tertiary">
          <h3 className="font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-primary rounded transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
}: ConfirmDialogProps) {
  const buttonClass = {
    default: 'btn-primary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-primary',
  }[variant];

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={open} onClose={handleCancel} title={title} size="sm">
      <div className="text-text-secondary mb-6">{message}</div>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={handleCancel}>
          {cancelText}
        </button>
        <button className={buttonClass} onClick={handleConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
