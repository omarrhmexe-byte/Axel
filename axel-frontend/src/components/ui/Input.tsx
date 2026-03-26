import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?:  string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={uid} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={uid}
          className={cn(
            'h-10 px-3.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm',
            'placeholder:text-stone-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-all duration-150',
            error && 'border-rose-300 focus:ring-rose-400',
            className,
          )}
          {...props}
        />
        {hint  && !error && <p className="text-xs text-stone-400">{hint}</p>}
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ── Textarea variant ──────────────────────────────────────────────────────────
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?:  string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={uid} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={uid}
          className={cn(
            'px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm',
            'placeholder:text-stone-400 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-all duration-150',
            error && 'border-rose-300 focus:ring-rose-400',
            className,
          )}
          {...props}
        />
        {hint  && !error && <p className="text-xs text-stone-400">{hint}</p>}
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
