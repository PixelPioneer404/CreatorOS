import React from 'react';
import { cn } from '../../lib/utils.js';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-8 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h4 className="text-base font-semibold text-zinc-200 mb-1">{title}</h4>
      <p className="text-sm text-zinc-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
