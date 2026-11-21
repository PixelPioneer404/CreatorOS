import React from 'react';
import { cn } from '../../lib/utils.js';

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    outline: 'border-zinc-700 text-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
