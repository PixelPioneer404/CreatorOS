import React from 'react';
import { cn } from '../../lib/utils.js';

export function PageHeader({
  title,
  description,
  actions,
  className,
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-800/80 mb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
