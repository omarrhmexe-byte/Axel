/**
 * KanbanCard — candidate decision surface.
 *
 * Collapsed: header + quick take + chips + first risk + compact actions
 * Expanded (click): all 7 sections — header · why fit · ambition ·
 *                   value · risks · advisory · actions
 *
 * Hover: lift + glow matched to confidence level
 * Actions: stage-aware — Advance/Hold/Reject → reason → confirm
 */

import { useState }                from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Minus, XCircle, ArrowRight,
  Loader2, Copy, Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import { confidenceLabel, sourceLabel }          from '../../lib/utils';
import { submitFeedback, generateOutreach }       from '../../lib/api';
import type { PipelineCandidate, OutreachResult } from '../../types';
import type { CandidateStage }                   from '../../hooks/useStageStore';

// ── Confidence tokens ─────────────────────────────────────────────────────────
const CONF = {
  high: {
    bar:    'linear-gradient(90deg,#34d399 0%,rgba(52,211,153,0.08) 100%)',
    border: 'border-emerald-900/50',
    badge:  'border-emerald-900/60 bg-emerald-950/40',
    dot:    'bg-emerald-500',
    text:   'text-emerald-400',
    chip:   'bg-emerald-950/30 border-emerald-900/50 text-emerald-400',
    take:   'border-emerald-700/50 bg-emerald-950/20',
    glow:   '0 0 0 1px rgba(52,211,153,0.12), 0 8px 32px rgba(0,0,0,0.55)',
  },
  medium: {
    bar:    'linear-gradient(90deg,#f59e0b 0%,rgba(245,158,11,0.08) 100%)',
    border: 'border-amber-900/40',
    badge:  'border-amber-900/50 bg-amber-950/30',
    dot:    'bg-amber-500',
    text:   'text-amber-400',
    chip:   'bg-amber-950/20 border-amber-900/40 text-amber-400',
    take:   'border-amber-700/40 bg-amber-950/10',
    glow:   '0 0 0 1px rgba(245,158,11,0.10), 0 8px 32px rgba(0,0,0,0.55)',
  },
  low: {
    bar:    'linear-gradient(90deg,#a78bfa 0%,rgba(167,139,250,0.08) 100%)',
    border: 'border-violet-900/40',
    badge:  'border-violet-900/50 bg-violet-950/30',
    dot:    'bg-violet-500',
    text:   'text-violet-400',
    chip:   'bg-violet-950/20 border-violet-900/40 text-violet-400',
    take:   'border-violet-700/40 bg-violet-950/10',
    glow:   '0 0 0 1px rgba(167,139,250,0.10), 0 8px 32px rgba(0,0,0,0.55)',
  },
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface KanbanCardProps {
  candidate:    PipelineCandidate;
  stage:        CandidateStage;
  roleId:       string;
  index:        number;
  onStage:      (stage: CandidateStage) => void;
  onOpenDetail: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────
export function KanbanCard({
  candidate, stage, roleId, index, onStage, onOpenDetail,
}: KanbanCardProps) {
  const conf  = candidate.confidence;
  const c     = CONF[conf];

  // Derived data
  const whyInteresting = (candidate.advisory?.why_interesting ?? []).slice(0, 2);
  const riskUnknown    = (candidate.advisory?.risk_unknown    ?? []).slice(0, 1);
  const trajectory     = (candidate.advisory?.trajectory      ?? []).slice(0, 2);
  const questionToAsk  = candidate.advisory?.question_to_ask ?? null;
  const whyFit         = (candidate.card?.sections.alignment ?? candidate.match_reasons ?? []).slice(0, 3);
  const ambition       = [
    ...(candidate.motivation_signals       ?? []),
    ...(candidate.card?.sections.motivation ?? []),
    ...(candidate.derived_signals?.primary_languages ?? []),
  ].filter(Boolean).slice(0, 5);
  const valueItems   = (candidate.card?.sections.value ?? candidate.value_signals ?? []).slice(0, 3);
  const expChips     = (candidate.card?.sections.experience ?? []).slice(0, 5);
  const risks        = (candidate.card?.sections.risks ?? candidate.concerns ?? []).slice(0, 2);
  const headline     = candidate.card?.headline
    ?? candidate.summary?.split('.')[0]
    ?? '';

  // ── State ─────────────────────────────────────────────────────────────────
  const [expanded,      setExpanded]      = useState(false);
  const [pendingAction, setPendingAction] = useState<'advance' | 'hold' | 'reject' | null>(null);
  const [reason,        setReason]        = useState('');
  const [acting,        setActing]        = useState(false);

  // Outreach (shortlisted)
  const [outreach,       setOutreach]        = useState<OutreachResult | null>(null);
  const [outreachBusy,   setOutreachBusy]    = useState(false);
  const [outreachOpen,   setOutreachOpen]    = useState(false);
  const [copied,         setCopied]          = useState(false);

  // Response (outreach_sent)
  const [noReply, setNoReply] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function confirmAction() {
    if (!pendingAction) return;
    setActing(true);
    try {
      await submitFeedback(
        candidate.candidate_id, roleId,
        pendingAction === 'advance' ? 'advance'
          : pendingAction === 'reject' ? 'reject' : 'thumbs_up',
        reason.trim() ? { data: { reason } } : undefined,
      );
      if (pendingAction === 'advance') onStage('shortlisted');
      if (pendingAction === 'reject')  onStage('rejected');
      if (pendingAction === 'hold')    onStage('hold');
    } finally {
      setActing(false);
      setPendingAction(null);
      setReason('');
    }
  }

  async function handleOutreach() {
    setOutreachBusy(true);
    setOutreachOpen(true);
    try {
      const r = await generateOutreach(roleId, candidate.candidate_id);
      setOutreach(r);
    } finally {
      setOutreachBusy(false);
    }
  }

  function handleCopyAndSend() {
    if (!outreach) return;
    navigator.clipboard.writeText(`Subject: ${outreach.subject}\n\n${outreach.body}`);
    setCopied(true);
    setTimeout(() => { setCopied(false); onStage('outreach_sent'); setOutreachOpen(false); }, 1400);
  }

  function stopProp(e: React.MouseEvent) { e.stopPropagation(); }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -3, boxShadow: c.glow }}
      onClick={() => !pendingAction && setExpanded(v => !v)}
      className={`relative bg-stone-900 border ${c.border} rounded-2xl overflow-hidden cursor-pointer select-none
        shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-colors duration-200`}
    >
      {/* ── Confidence gradient bar ─────────────────────────────────────── */}
      <div className="h-[3px] w-full" style={{ background: c.bar }} />

      {/* ── Header — always visible ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-stone-100 tracking-tight leading-tight truncate">
              {candidate.candidate_name}
            </h3>
            <p className="text-[12px] text-stone-500 mt-0.5 truncate leading-snug">
              {headline}
            </p>
          </div>
          {/* Confidence badge */}
          <div className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-mono uppercase tracking-widest ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            <span className={c.text}>{confidenceLabel(conf)}</span>
          </div>
        </div>

        {/* Source line */}
        <p className="text-[10px] font-mono text-stone-700 mt-2">
          {sourceLabel(candidate.source, candidate.derived_signals)}
        </p>
      </div>

      {/* ── Collapsed preview ───────────────────────────────────────────── */}
      {!expanded && (
        <div className="px-4 pb-3 space-y-2.5">
          {whyInteresting[0] && (
            <p className="text-[12px] text-stone-400 italic leading-relaxed line-clamp-2">
              "{whyInteresting[0]}"
            </p>
          )}
          {ambition.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ambition.slice(0, 3).map((chip, i) => (
                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${c.chip} font-medium`}>
                  {chip}
                </span>
              ))}
            </div>
          )}
          {risks[0] && (
            <p className="text-[11px] text-stone-600 flex items-start gap-1.5">
              <span className="text-rose-700 shrink-0 mt-px text-xs">!</span>
              <span className="line-clamp-1">{risks[0]}</span>
            </p>
          )}
        </div>
      )}

      {/* ── Expanded sections ───────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: 'hidden' }}
            onClick={stopProp}
          >
            <div className="px-4 space-y-4 pb-4">

              {/* Advisory signals */}
              {whyInteresting.length > 0 && (
                <div className={`rounded-xl p-3.5 border-l-[3px] ${c.take}`}>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-stone-600 mb-2">
                    Why interesting
                  </p>
                  <ul className="space-y-1.5">
                    {whyInteresting.map((s, i) => (
                      <li key={i} className="text-[12px] text-stone-300 leading-snug flex gap-2">
                        <span className="text-stone-700 shrink-0 mt-0.5 font-mono text-[10px]">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk / unknown */}
              {riskUnknown.length > 0 && (
                <div className="rounded-xl p-3.5 border-l-[3px] border-rose-900/40">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-stone-600 mb-2">
                    Risk / Unknown
                  </p>
                  <ul className="space-y-1">
                    {riskUnknown.map((r, i) => (
                      <li key={i} className="text-[12px] text-stone-500 flex gap-2 leading-snug">
                        <span className="text-rose-900 shrink-0 mt-0.5">△</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trajectory */}
              {trajectory.length > 0 && (
                <div className="rounded-xl p-3.5 border-l-[3px] border-sky-900/40">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-stone-600 mb-2">
                    Trajectory
                  </p>
                  <ul className="space-y-1">
                    {trajectory.map((t, i) => (
                      <li key={i} className="text-[12px] text-stone-400 flex gap-2 leading-snug">
                        <span className="text-sky-900 shrink-0 mt-0.5 font-mono text-[10px]">↗</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Why they fit */}
              {whyFit.length > 0 && (
                <div>
                  <CardLabel>Why they fit</CardLabel>
                  <ul className="space-y-1.5">
                    {whyFit.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 shrink-0 text-xs mt-0.5">✓</span>
                        <span className="text-[13px] text-stone-400 leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ambition signals — chips */}
              {ambition.length > 0 && (
                <div>
                  <CardLabel>Ambition signals</CardLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {ambition.map((chip, i) => (
                      <span key={i}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${c.chip}`}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Where they add value */}
              {valueItems.length > 0 && (
                <div>
                  <CardLabel>Where they add value</CardLabel>
                  <ul className="space-y-1.5">
                    {valueItems.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-stone-600 shrink-0 text-xs mt-0.5">◆</span>
                        <span className="text-[13px] text-stone-400 leading-snug">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Experience chips */}
              {expChips.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {expChips.map((e, i) => (
                    <span key={i}
                      className="text-[10px] bg-stone-800/60 text-stone-500 px-2 py-0.5 rounded-full border border-stone-700/40">
                      {e}
                    </span>
                  ))}
                </div>
              )}

              {/* Risks */}
              {risks.length > 0 && (
                <div>
                  <CardLabel>Risks</CardLabel>
                  <ul className="space-y-1.5">
                    {risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-700 shrink-0 text-xs mt-0.5">!</span>
                        <span className="text-[13px] text-stone-500 leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Question to ask */}
              {questionToAsk && (
                <div>
                  <CardLabel>Ask before you call</CardLabel>
                  <p className="text-[12px] text-stone-400 leading-relaxed
                    bg-stone-900/60 border border-stone-800 border-l-2 border-l-amber-800
                    rounded-lg px-3 py-2.5 mt-1.5">
                    {questionToAsk}
                  </p>
                </div>
              )}

              {/* Outreach (shortlisted stage) */}
              {stage === 'shortlisted' && outreachOpen && (
                <div className="rounded-xl border border-stone-800 overflow-hidden">
                  {outreachBusy ? (
                    <div className="flex items-center gap-2 text-xs text-stone-600 px-4 py-3">
                      <Loader2 className="w-3 h-3 animate-spin" /> Writing outreach…
                    </div>
                  ) : outreach ? (
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[9px] font-mono text-stone-600 uppercase tracking-widest mb-1">
                          Subject
                        </p>
                        <p className="text-xs text-stone-300">{outreach.subject}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-mono text-stone-600 uppercase tracking-widest mb-2">
                          Message
                        </p>
                        <pre className="text-xs text-stone-400 whitespace-pre-wrap font-sans leading-relaxed">
                          {outreach.body}
                        </pre>
                      </div>
                      <button
                        onClick={handleCopyAndSend}
                        className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                      >
                        {copied
                          ? <Check className="w-3 h-3 text-emerald-500" />
                          : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied — marking sent…' : 'Copy & mark sent'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-400 px-4 py-3">Failed to generate. Try again.</p>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expand toggle hint ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center pb-1 -mt-1" onClick={stopProp}>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-stone-800 hover:text-stone-600 transition-colors p-0.5"
        >
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Reason prompt ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
            onClick={stopProp}
          >
            <div className="mx-4 mb-3 p-3 bg-stone-800/50 rounded-xl border border-stone-700/60">
              <p className="text-[9px] font-mono uppercase tracking-widest text-stone-600 mb-2">
                {pendingAction === 'advance' ? 'Advance' :
                 pendingAction === 'reject'  ? 'Reject'  : 'Hold'} · add a note (optional)
              </p>
              <input
                autoFocus
                value={reason}
                onChange={e => setReason(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmAction();
                  if (e.key === 'Escape') { setPendingAction(null); setReason(''); }
                }}
                placeholder="e.g. strong infra depth, limited leadership context"
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs
                  text-stone-200 placeholder:text-stone-700 focus:outline-none focus:border-stone-500 mb-2.5"
              />
              <div className="flex gap-2">
                <button
                  onClick={confirmAction}
                  disabled={acting}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold
                    bg-stone-200 text-stone-900 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  {acting
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <CheckCircle2 className="w-3 h-3" />}
                  Confirm
                </button>
                <button
                  onClick={() => { setPendingAction(null); setReason(''); }}
                  className="text-xs px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-300
                    hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action row ─────────────────────────────────────────────────── */}
      <div
        className="px-4 pb-4 border-t border-stone-800/60 pt-3"
        onClick={stopProp}
      >
        {/* Stage: new — primary decision row */}
        {stage === 'new' && !pendingAction && (
          expanded ? (
            /* Expanded: Advance is the dominant CTA */
            <div className="space-y-2">
              <button
                onClick={() => setPendingAction('advance')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                  bg-emerald-950 border border-emerald-800/60 text-emerald-400
                  hover:bg-emerald-900/60 hover:border-emerald-700 text-sm font-semibold
                  transition-all duration-150 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Advance candidate
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingAction('hold')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                    border border-stone-800 text-stone-500 text-xs font-medium
                    hover:border-stone-600 hover:text-stone-300 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Hold
                </button>
                <button
                  onClick={() => setPendingAction('reject')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                    border border-rose-950/60 text-rose-700 text-xs font-medium
                    hover:border-rose-900 hover:text-rose-500 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={onOpenDetail}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl
                    border border-stone-800 text-stone-600 text-xs
                    hover:border-stone-600 hover:text-stone-400 transition-all"
                >
                  Brief
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed: compact row */
            <div className="flex items-center gap-1.5">
              <SmallBtn
                label="Advance"
                icon={<CheckCircle2 className="w-3 h-3" />}
                variant="success"
                onClick={() => { setPendingAction('advance'); setExpanded(true); }}
              />
              <SmallBtn
                label="Hold"
                icon={<Minus className="w-3 h-3" />}
                variant="neutral"
                onClick={() => { setPendingAction('hold'); }}
              />
              <SmallBtn
                label="Reject"
                icon={<XCircle className="w-3 h-3" />}
                variant="danger"
                onClick={() => { setPendingAction('reject'); }}
              />
              <button
                onClick={onOpenDetail}
                className="ml-auto flex items-center gap-1 text-[11px] text-stone-600
                  hover:text-stone-400 transition-colors"
              >
                Brief <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )
        )}

        {/* Stage: shortlisted */}
        {stage === 'shortlisted' && !pendingAction && (
          <div className="flex items-center gap-2">
            {!outreachOpen ? (
              <button
                onClick={handleOutreach}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl
                  border border-stone-700 text-stone-400
                  hover:border-stone-500 hover:text-stone-200 transition-all font-medium"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Generate outreach
              </button>
            ) : (
              <button
                onClick={() => setOutreachOpen(false)}
                className="text-[11px] text-stone-600 hover:text-stone-400 transition-colors"
              >
                Hide draft
              </button>
            )}
            <button
              onClick={onOpenDetail}
              className="ml-auto flex items-center gap-1 text-[11px] text-stone-600
                hover:text-stone-400 transition-colors"
            >
              Brief <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Stage: outreach_sent */}
        {stage === 'outreach_sent' && (
          <div className="space-y-2">
            {!noReply ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onStage('responded')}
                  className="flex-1 py-2 rounded-xl border border-emerald-900/50 bg-emerald-950/20
                    text-emerald-500 text-xs font-medium hover:bg-emerald-950/40 transition-all"
                >
                  Responded ✓
                </button>
                <button
                  onClick={() => setNoReply(true)}
                  className="flex-1 py-2 rounded-xl border border-stone-800 text-stone-500
                    text-xs hover:border-stone-600 transition-all"
                >
                  No response
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-stone-700 italic py-1">No response yet</p>
            )}
          </div>
        )}

        {/* Stage: responded */}
        {stage === 'responded' && (
          <button
            onClick={() => onStage('interviewing')}
            className="w-full py-2.5 rounded-xl border border-stone-700 text-stone-400
              text-xs font-medium hover:border-stone-500 hover:text-stone-200 transition-all"
          >
            Move to Interviewing →
          </button>
        )}

        {/* Stage: interviewing */}
        {stage === 'interviewing' && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-600 uppercase tracking-widest">
              In process
            </span>
            <button
              onClick={onOpenDetail}
              className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-400 transition-colors"
            >
              Brief <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Small button (compact mode) ───────────────────────────────────────────────
function SmallBtn({
  label, icon, variant, onClick,
}: {
  label: string; icon: React.ReactNode;
  variant: 'success' | 'neutral' | 'danger'; onClick: () => void;
}) {
  const cls = {
    success: 'border-emerald-900/60 text-emerald-600 hover:bg-emerald-950/40 hover:text-emerald-400',
    neutral: 'border-stone-800 text-stone-500 hover:bg-stone-800 hover:text-stone-300',
    danger:  'border-rose-950/60 text-rose-800 hover:bg-rose-950/30 hover:text-rose-600',
  }[variant];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border
        font-medium transition-all ${cls}`}
    >
      {icon}{label}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-mono uppercase tracking-widest text-stone-600 mb-2">
      {children}
    </p>
  );
}
