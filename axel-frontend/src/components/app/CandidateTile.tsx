/**
 * CandidateTile — compact square-ish decision tile.
 *
 * Shows only: confidence · name · role@company · location/exp · 1-line insight
 * Accept / Reject directly on the tile — instant, no confirm prompt.
 * Click body → opens signal drawer.
 *
 * Motion: enters with scale, exits with scale+fade, layoutId for cross-stage animation.
 */

import { useState }                from 'react';
import { motion }                  from 'framer-motion';
import { Check, X, Loader2 }       from 'lucide-react';
import { confidenceLabel }         from '../../lib/utils';
import { submitFeedback }          from '../../lib/api';
import type { PipelineCandidate }  from '../../types';
import type { CandidateStage }     from '../../hooks/useStageStore';

// ── Confidence color map ──────────────────────────────────────────────────────
const CONF_DOT: Record<string, string> = {
  high:   'bg-emerald-500',
  medium: 'bg-amber-500',
  low:    'bg-violet-500',
};
const CONF_LABEL_COLOR: Record<string, string> = {
  high:   'text-emerald-600',
  medium: 'text-amber-600',
  low:    'text-violet-600',
};
const CONF_BORDER: Record<string, string> = {
  high:   'border-emerald-900/40 hover:border-emerald-800/60',
  medium: 'border-amber-900/30  hover:border-amber-800/50',
  low:    'border-violet-900/30 hover:border-violet-800/50',
};
const CONF_GLOW: Record<string, string> = {
  high:   '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.1)',
  medium: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.08)',
  low:    '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.08)',
};

// ── Insight extraction ────────────────────────────────────────────────────────
function extractInsight(c: PipelineCandidate): string {
  // Use the first advisory signal — most specific evidence-based observation
  if (c.advisory?.why_interesting?.[0]) return c.advisory.why_interesting[0];
  if (c.match_reasons?.[0]) return c.match_reasons[0];
  return c.summary?.split('.')[0]?.trim() ?? '';
}

// ── Parse role@company from headline ─────────────────────────────────────────
function parseHeadline(c: PipelineCandidate): { role: string; company: string } {
  const h = c.card?.headline ?? c.summary?.split('.')[0] ?? '';
  const parts = h.split(/\s*[·@]\s*/);
  if (parts.length >= 2) return { role: parts[0].trim(), company: parts[1].trim() };
  return { role: h, company: '' };
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  candidate: PipelineCandidate;
  stage:     CandidateStage;
  roleId:    string;
  index:     number;
  onStage:   (stage: CandidateStage) => void;
  onOpen:    () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CandidateTile({ candidate, stage, roleId, index, onStage, onOpen }: Props) {
  const conf = candidate.confidence;
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const { role, company }  = parseHeadline(candidate);
  const insight            = extractInsight(candidate);
  const location           = (candidate as any).location as string | undefined;
  const years              = (candidate as any).years_of_experience as number | undefined;

  async function handleAccept(e: React.MouseEvent) {
    e.stopPropagation();
    setAccepting(true);
    try {
      await submitFeedback(candidate.candidate_id, roleId, 'advance');
      onStage('shortlisted');
    } finally { setAccepting(false); }
  }

  async function handleReject(e: React.MouseEvent) {
    e.stopPropagation();
    setRejecting(true);
    try {
      await submitFeedback(candidate.candidate_id, roleId, 'reject');
      onStage('rejected');
    } finally { setRejecting(false); }
  }

  return (
    <motion.div
      layout
      layoutId={candidate.candidate_id}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -3, boxShadow: CONF_GLOW[conf] }}
      onClick={onOpen}
      className={`
        relative bg-stone-900 border rounded-2xl p-4 cursor-pointer
        flex flex-col gap-3 select-none
        shadow-[0_2px_8px_rgba(0,0,0,0.3)]
        transition-colors duration-150
        ${CONF_BORDER[conf]}
      `}
    >
      {/* ── Confidence indicator ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CONF_DOT[conf]}`} />
        <span className={`text-[9px] font-mono uppercase tracking-widest ${CONF_LABEL_COLOR[conf]}`}>
          {confidenceLabel(conf)}
        </span>
      </div>

      {/* ── Identity ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-stone-100 tracking-tight leading-tight mb-1 truncate">
          {candidate.candidate_name}
        </h3>
        <p className="text-[12px] text-stone-500 truncate">
          {role}{company ? <> <span className="text-stone-700">@</span> {company}</> : null}
        </p>
        {(location || years) && (
          <p className="text-[11px] text-stone-700 mt-0.5">
            {[location, years ? `${years} yrs` : null].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* ── Insight — 1-line compressed intelligence ──────────────────── */}
      {insight && (
        <p className="text-[12px] italic text-stone-400 leading-snug line-clamp-2
          border-l-2 border-stone-700/60 pl-2.5">
          {insight}
        </p>
      )}

      {/* ── Action buttons ────────────────────────────────────────────── */}
      {(stage === 'new') && (
        <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleAccept}
            disabled={accepting || rejecting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              bg-emerald-950/50 border border-emerald-900/50 text-emerald-500
              text-xs font-semibold hover:bg-emerald-900/60 hover:border-emerald-700
              disabled:opacity-40 transition-all active:scale-95"
          >
            {accepting
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Check className="w-3 h-3" />}
            Accept
          </button>
          <button
            onClick={handleReject}
            disabled={accepting || rejecting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              bg-rose-950/30 border border-rose-900/40 text-rose-600
              text-xs font-semibold hover:bg-rose-950/60 hover:border-rose-800
              disabled:opacity-40 transition-all active:scale-95"
          >
            {rejecting
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <X className="w-3 h-3" />}
            Reject
          </button>
        </div>
      )}

      {/* Stage badge for non-new stages */}
      {stage !== 'new' && (
        <div className="pt-1 border-t border-stone-800/60">
          <span className="text-[9px] font-mono uppercase tracking-widest text-stone-700">
            {stage.replace('_', ' ')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
