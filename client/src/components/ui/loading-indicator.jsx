import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Spinner({ className, size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <Loader2
      className={cn('animate-spin text-indigo-500', sizes[size], className)}
    />
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-zinc-800/60', className)}
      {...props}
    />
  );
}

export function FullPageLoader({ text = 'Loading Creator OS...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-zinc-400 font-medium">{text}</p>
    </div>
  );
}
