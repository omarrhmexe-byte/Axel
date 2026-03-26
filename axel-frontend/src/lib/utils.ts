import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  AlignmentGroup,
  ConfidenceLevel,
  CandidateSource,
  DerivedSignals,
  PipelineCandidate,
  PipelineGroups,
  ConfidencePipeline,
} from '../types';

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Confidence mapping ───────────────────────────────────────────────────────
/** Map backend `alignment` to frontend `confidence`. */
export function toConfidence(alignment: AlignmentGroup): ConfidenceLevel {
  switch (alignment) {
    case 'strong_alignment':   return 'high';
    case 'moderate_alignment': return 'medium';
    case 'explore':            return 'low';
    default:                   return 'low';
  }
}

/** Human-readable confidence label shown in the UI. */
export function confidenceLabel(level: ConfidenceLevel): string {
  return { high: 'High Signal', medium: 'Good Signal', low: 'Worth Exploring' }[level];
}

/** Dot + badge Tailwind classes per confidence level. */
export const confidenceStyles: Record<
  ConfidenceLevel,
  { dot: string; badge: string; column: string; border: string }
> = {
  high: {
    dot:    'bg-emerald-500',
    badge:  'badge-high',
    column: 'border-l-emerald-400',
    border: 'border-emerald-100',
  },
  medium: {
    dot:    'bg-amber-500',
    badge:  'badge-medium',
    column: 'border-l-amber-400',
    border: 'border-amber-100',
  },
  low: {
    dot:    'bg-violet-500',
    badge:  'badge-low',
    column: 'border-l-violet-400',
    border: 'border-violet-100',
  },
};

// ─── Source context ───────────────────────────────────────────────────────────
/**
 * Returns a rich source label shown inside the candidate card.
 * e.g. "GitHub · Active Open Source"
 */
export function sourceLabel(
  source: CandidateSource | string | undefined,
  signals?: DerivedSignals,
): string {
  if (!source) return 'Unknown Source';
  if (source === 'github') {
    const activity = signals?.open_source_activity;
    if (activity === 'active')   return 'GitHub · Active Open Source';
    if (activity === 'moderate') return 'GitHub · Personal Projects';
    return 'GitHub · Profile';
  }
  if (source === 'linkedin') return 'LinkedIn · Headhunted';
  if (source === 'db')       return 'Internal DB · Referred';
  return String(source);
}

/** CSS class for source badge. */
export function sourceBadgeClass(source: CandidateSource | string | undefined): string {
  if (source === 'github')   return 'badge-github';
  if (source === 'linkedin') return 'badge-linkedin';
  if (source === 'db')       return 'badge-db';
  return 'badge-github';
}

// ─── Pipeline reshaping ───────────────────────────────────────────────────────
/**
 * Take the raw backend pipeline groups and:
 * 1. Attach `confidence` to every candidate.
 * 2. Re-key into frontend `ConfidencePipeline`.
 */
export function reshapePipeline(groups: PipelineGroups): ConfidencePipeline {
  const attach = (
    list: PipelineCandidate[],
    level: ConfidenceLevel,
  ): PipelineCandidate[] =>
    list.map((c) => ({ ...c, confidence: level }));

  return {
    high:   attach(groups.strong_alignment,   'high'),
    medium: attach(groups.moderate_alignment, 'medium'),
    low:    attach(groups.explore,            'low'),
  };
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export function pluralise(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
