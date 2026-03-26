import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Database, Linkedin, ArrowUpRight } from 'lucide-react';
import { CandidateModal } from './CandidateModal';
import type { PipelineCandidate } from '../../types';

interface CandidateCardProps {
  candidate: PipelineCandidate;
  index:     number;
}

// ─── Confidence config ────────────────────────────────────────────────────────
const CONF = {
  high: {
    accent:  'border-l-emerald-400',
    badge:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot:     'bg-emerald-500',
    label:   'High Signal',
    risk:    'text-emerald-600',
  },
  medium: {
    accent:  'border-l-amber-400',
    badge:   'bg-amber-50 text-amber-700 border-amber-200',
    dot:     'bg-amber-500',
    label:   'Good Signal',
    risk:    'text-amber-600',
  },
  low: {
    accent:  'border-l-violet-400',
    badge:   'bg-violet-50 text-violet-700 border-violet-200',
    dot:     'bg-violet-500',
    label:   'Worth Exploring',
    risk:    'text-violet-600',
  },
} as const;

// ─── Source icon ──────────────────────────────────────────────────────────────
function SourceIcon({ source }: { source?: string }) {
  if (source === 'github')   return <Github   className="w-3 h-3 text-stone-300" />;
  if (source === 'linkedin') return <Linkedin className="w-3 h-3 text-stone-300" />;
  return <Database className="w-3 h-3 text-stone-300" />;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function CandidateCard({ candidate, index }: CandidateCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const conf    = CONF[candidate.confidence] ?? CONF.low;
  const card    = candidate.card;
  const advisory = candidate.advisory;

  // Positioning line: advisory quick_take → card headline → summary
  const positioning: string | undefined =
    advisory?.quick_take ?? card?.headline ?? candidate.summary;

  // Signals: card alignment bullets → match_reasons
  const signals: string[] = (
    card?.sections?.alignment?.slice(0, 3) ??
    candidate.match_reasons?.slice(0, 3) ??
    []
  );

  // Open questions from advisory
  const questions: string[] = advisory?.open_questions?.slice(0, 2) ?? [];

  // Primary risk
  const risk: string | undefined =
    card?.sections?.risks?.[0] ?? candidate.concerns?.[0];

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 28 }}
        whileHover={{ y: -1, boxShadow: '0 6px 24px -4px rgba(0,0,0,0.10)' }}
        onClick={() => setModalOpen(true)}
        className={`
          group relative bg-white rounded-xl border border-stone-200/70 border-l-4 ${conf.accent}
          p-4 cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden
        `}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-extrabold font-display text-axel-ink text-[14px] leading-tight tracking-tight">
              {candidate.candidate_name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <SourceIcon source={candidate.source} />
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${conf.badge}`}>
              <span className={`w-1 h-1 rounded-full ${conf.dot}`} />
              {conf.label}
            </span>
          </div>
        </div>

        {/* ── Positioning thesis ─────────────────────────────── */}
        {positioning && (
          <div className="bg-stone-50/70 rounded-lg px-2.5 py-2 mb-2.5">
            <p className="text-[11px] text-stone-600 italic leading-relaxed line-clamp-2">
              {positioning}
            </p>
          </div>
        )}

        {/* ── Signals ───────────────────────────────────────── */}
        {signals.length > 0 && (
          <ul className="space-y-1 mb-2.5">
            {signals.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                <span className="font-mono text-stone-300 shrink-0 leading-relaxed">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="line-clamp-1">{s}</span>
              </li>
            ))}
          </ul>
        )}

        {/* ── Open questions (if advisory available) ─────────── */}
        {questions.length > 0 && (
          <div className="mb-2.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-stone-400 mb-1">
              Questions
            </p>
            <ul className="space-y-0.5">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-stone-500">
                  <span className="text-stone-300 mt-px shrink-0">·</span>
                  <span className="line-clamp-1">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Footer: risk + hover CTA ───────────────────────── */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {risk ? (
            <p className={`text-[10px] flex items-start gap-1 line-clamp-1 flex-1 mr-2 ${conf.risk}`}>
              <span className="shrink-0">△</span>
              {risk}
            </p>
          ) : (
            <span className="text-[10px] text-emerald-600">No significant risks</span>
          )}
          <span className="text-[10px] text-stone-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            Open briefing <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </motion.article>

      {/* Modal */}
      <CandidateModal
        candidate={candidate}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
