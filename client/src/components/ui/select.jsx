import React from 'react';
import { cn } from '../../lib/utils.js';

export const Select = React.forwardRef(({
  className,
  error,
  children,
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 transition-colors',
        'border-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';
