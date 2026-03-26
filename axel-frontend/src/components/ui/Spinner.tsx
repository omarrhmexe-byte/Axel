import { cn } from '../../lib/utils';

/** Three bouncing indigo dots — used to indicate AI activity. */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
        />
      ))}
      {label && <span className="ml-1 text-sm text-stone-500">{label}</span>}
    </span>
  );
}

/** Rotating circle — used for longer waits. */
export function LoadingRing({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin text-indigo-500', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
