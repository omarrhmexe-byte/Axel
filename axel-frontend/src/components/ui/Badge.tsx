import { cn } from '../../lib/utils';
import type { ConfidenceLevel, CandidateSource } from '../../types';
import { confidenceStyles, confidenceLabel, sourceLabel, sourceBadgeClass } from '../../lib/utils';
import type { DerivedSignals } from '../../types';

// ─── Confidence badge ─────────────────────────────────────────────────────────
interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export function ConfidenceBadge({ level, className }: ConfidenceBadgeProps) {
  const s = confidenceStyles[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        s.badge,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {confidenceLabel(level)}
    </span>
  );
}

// ─── Source badge ─────────────────────────────────────────────────────────────
interface SourceBadgeProps {
  source?: CandidateSource | string;
  derivedSignals?: DerivedSignals;
  className?: string;
}

export function SourceBadge({ source, derivedSignals, className }: SourceBadgeProps) {
  const label = sourceLabel(source, derivedSignals);
  const cls   = sourceBadgeClass(source);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

// ─── Generic badge ────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'indigo' | 'rose' | 'emerald';
  className?: string;
}

const variants = {
  default: 'bg-stone-100 text-stone-600 border border-stone-200',
  indigo:  'bg-indigo-50 text-indigo-700 border border-indigo-100',
  rose:    'bg-rose-50 text-rose-700 border border-rose-100',
  emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
