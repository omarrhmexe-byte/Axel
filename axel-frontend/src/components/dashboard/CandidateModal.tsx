import { Modal }           from '../ui/Modal';
import { ConfidenceBadge, SourceBadge } from '../ui/Badge';
import { AdvisoryPanel }   from './AdvisoryPanel';
import type { PipelineCandidate } from '../../types';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface Props {
  candidate: PipelineCandidate;
  open:      boolean;
  onClose:   () => void;
}

// ── A labelled card section ────────────────────────────────────────────────
function Section({
  title,
  items,
  variant = 'default',
}: {
  title:   string;
  items?:  string[];
  variant?: 'default' | 'risk';
}) {
  if (!items?.length) return null;

  const isRisk = variant === 'risk';
  return (
    <div>
      <div className={`flex items-center gap-2 mb-2 pb-1.5 border-b ${isRisk ? 'border-rose-100' : 'border-stone-100'}`}>
        {isRisk && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
        <p className={`text-xs font-bold uppercase tracking-wide ${isRisk ? 'text-rose-500' : 'text-stone-400'}`}>
          {title}
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 text-sm leading-snug ${isRisk ? 'text-rose-700' : 'text-stone-700'}`}
          >
            <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isRisk ? 'text-rose-300' : 'text-indigo-300'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CandidateModal({ candidate, open, onClose }: Props) {
  const card     = candidate.card;
  const advisory = candidate.advisory;
  const sections = card?.sections;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={candidate.candidate_name}
      size="xl"
    >
      {/* ── Identity header ─────────────────────────────────────── */}
      <div className="mb-6 pb-5 border-b border-stone-100">
        {card?.headline && (
          <p className="text-stone-500 mb-3">{card.headline}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceBadge level={candidate.confidence} />
          <SourceBadge
            source={candidate.source}
            derivedSignals={candidate.derived_signals}
          />
          {candidate.derived_signals?.primary_languages?.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs font-medium border border-stone-200"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left: Candidate signal sections */}
        <div className="space-y-5">
          <Section title="Why They Fit"      items={sections?.alignment  ?? candidate.match_reasons} />
          <Section title="Experience"        items={sections?.experience} />
          <Section title="Motivation"        items={sections?.motivation} />
          <Section title="Where They Add Value" items={sections?.value}  />
          <Section
            title="Risks & Gaps"
            items={sections?.risks ?? candidate.concerns}
            variant="risk"
          />

          {/* Raw signals fallback if no card */}
          {!card && candidate.summary && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Summary</p>
              <p className="text-sm text-stone-700 leading-relaxed">{candidate.summary}</p>
            </div>
          )}

          {/* Motivation & value signals if present */}
          {(candidate.motivation_signals?.length || candidate.value_signals?.length) && (
            <div className="space-y-3 pt-2">
              {candidate.motivation_signals && candidate.motivation_signals.length > 0 && (
                <Section title="Motivation Signals" items={candidate.motivation_signals} />
              )}
              {candidate.value_signals && candidate.value_signals.length > 0 && (
                <Section title="Value Signals" items={candidate.value_signals} />
              )}
            </div>
          )}
        </div>

        {/* Right: Hiring Advisory */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              Hiring Advisory
            </p>
          </div>

          {advisory ? (
            <AdvisoryPanel advisory={advisory} />
          ) : (
            <div className="bg-stone-50 rounded-xl p-6 text-center border border-stone-100">
              <p className="text-sm text-stone-400">
                Advisory queued.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
