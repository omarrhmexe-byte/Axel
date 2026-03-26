import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow',
  secondary: 'bg-stone-900 text-white hover:bg-stone-800',
  ghost:     'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
  outline:   'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50',
};

const sizes = {
  sm: 'h-8  px-3   text-sm  rounded-lg  gap-1.5',
  md: 'h-9  px-4   text-sm  rounded-xl  gap-2',
  lg: 'h-11 px-5   text-base rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold font-display',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
