import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function AlertBanner({
  variant = 'info',
  title,
  message,
  onDismiss,
  className,
}) {
  const variants = {
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    error: AlertCircle,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 text-sm shadow-sm',
        variants[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5 text-current">{title}</h5>}
        <div className="text-zinc-300 leading-relaxed">{message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
