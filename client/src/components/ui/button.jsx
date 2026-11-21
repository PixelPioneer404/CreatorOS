import React from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-950/50',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-800 border border-zinc-700/60',
    outline: 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800/60 hover:text-white',
    ghost: 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white',
    destructive: 'bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-11 px-6 text-base rounded-lg gap-2.5',
    icon: 'h-9 w-9 rounded-lg p-0',
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
