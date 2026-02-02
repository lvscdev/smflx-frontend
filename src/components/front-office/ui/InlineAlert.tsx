'use client';

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

type Variant = 'error' | 'warning' | 'success' | 'info';

export function InlineAlert({
  variant,
  title,
  children,
  actionLabel,
  onAction,
  className = '',
}: {
  variant: Variant;
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  const styles =
    variant === 'error'
      ? { wrap: 'border-red-200 bg-red-50 text-red-800', icon: <AlertCircle className="w-4 h-4" /> }
      : variant === 'warning'
      ? { wrap: 'border-amber-200 bg-amber-50 text-amber-900', icon: <TriangleAlert className="w-4 h-4" /> }
      : variant === 'success'
      ? { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: <CheckCircle2 className="w-4 h-4" /> }
      : { wrap: 'border-slate-200 bg-slate-50 text-slate-800', icon: <Info className="w-4 h-4" /> };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles.wrap} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{styles.icon}</div>
          <div>
            {title ? <div className="font-medium mb-0.5">{title}</div> : null}
            <div>{children}</div>
          </div>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center whitespace-nowrap font-medium hover:underline"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
