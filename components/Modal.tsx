'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const w = width === 'sm' ? 'max-w-md' : width === 'lg' ? 'max-w-2xl' : 'max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[85vh]', w)}>
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-unbound-border">
          <div>
            <h2 className="text-[15px] font-semibold text-unbound-text-primary">{title}</h2>
            {subtitle && (
              <p className="text-[12px] text-unbound-text-tertiary mt-0.5">{subtitle}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-unbound-bg-hover">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto text-[13px]">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-unbound-border bg-unbound-bg-hover flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Toast({ message, kind = 'info' }: { message: string; kind?: 'info' | 'success' }) {
  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-[13px] shadow-lg',
        kind === 'success' ? 'bg-sev-low text-white' : 'bg-unbound-text-primary text-white'
      )}
    >
      {message}
    </div>
  );
}
