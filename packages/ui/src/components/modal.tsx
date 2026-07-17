'use client';

import { useEffect, useRef, HTMLAttributes } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,20,26,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={[
          'relative w-full bg-[var(--bg-ivory)] rounded-2xl p-8',
          'animate-scale-in',
          sizeMap[size],
        ].join(' ')}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--ui-gray-100)] transition-colors"
          aria-label="بستن"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {title && (
          <h2
            id="modal-title"
            className="font-display font-semibold text-h2 text-[var(--color-text)] mb-6"
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
