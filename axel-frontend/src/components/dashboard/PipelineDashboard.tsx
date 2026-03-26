import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { CandidateCard } from './CandidateCard';
import { SystemLog }     from './SystemLog';
import { Spinner }       from '../ui/Spinner';
import type {
  PipelineRunResponse,
  ConfidencePipeline,
  ConfidenceLevel,
  PipelineCandidate,
} from '../../types';
import { confidenceStyles, confidenceLabel, reshapePipeline } from '../../lib/utils';

// ─── Column ───────────────────────────────────────────────────────────────────
interface ColumnProps {
  level:      ConfidenceLevel;
  candidates: PipelineCandidate[];
  colIndex:   number;
}

function PipelineColumn({ level, candidates, colIndex }: ColumnProps) {
  const s = confidenceStyles[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colIndex * 0.1, type: 'spring', stiffness: 280, damping: 28 }}
      className="flex flex-col min-h-[200px]"
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-1 py-2.5 mb-3 border-l-2 ${s.column}`}>
        <div className="flex items-center gap-2 pl-2">
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-sm font-bold font-display text-stone-800">
            {confidenceLabel(level)}
          </span>
        </div>
        <span className="text-xs font-semibold text-stone-400">
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2.5">
        <AnimatePresence>
          {candidates.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-8">
              None in this tier.
            </p>
          ) : (
            candidates.map((c, i) => (
              <CandidateCard key={c.candidate_id} candidate={c} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
interface Props {
  run: PipelineRunResponse;
}

export function PipelineDashboard({ run }: Props) {
  const [logOpen, setLogOpen] = useState(false);

  const isRunning = run.status === 'pending' || run.status === 'running';
  const isDone    = run.status === 'completed';

  const pipeline: ConfidencePipeline | null = isDone && run.pipeline
    ? reshapePipeline(run.pipeline)
    : null;

  const totalMatched = (pipeline?.high?.length ?? 0) +
                       (pipeline?.medium?.length ?? 0) +
                       (pipeline?.low?.length ?? 0);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

      {/* ── Run header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            {isRunning && <Spinner />}
            {isDone && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Briefing ready
              </span>
            )}
            {run.status === 'failed' && (
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                Failed
              </span>
            )}
          </div>

          {isDone && pipeline && (
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span>{(pipeline.high?.length ?? 0) + (pipeline.medium?.length ?? 0) + (pipeline.low?.length ?? 0)} matched</span>
              <span className="text-emerald-600 font-semibold">{pipeline.high?.length ?? 0} strong</span>
              <span className="text-amber-600 font-semibold">{pipeline.medium?.length ?? 0} good</span>
              <span className="text-violet-600 font-semibold">{pipeline.low?.length ?? 0} explore</span>
            </div>
          )}
        </div>

        {run.headline ? (
          <p className="text-sm text-stone-600">{run.headline}</p>
        ) : isRunning ? (
          <p className="text-sm text-stone-500 italic">Axel is sourcing.</p>
        ) : null}

        {run.role_intelligence && (
          <p className="text-xs text-stone-400 mt-1 line-clamp-1">
            {run.role_intelligence.role_summary}
          </p>
        )}

        {/* Pipeline log toggle */}
        {run.system_log?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <button
              onClick={() => setLogOpen((v) => !v)}
              className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              Pipeline log ({run.system_log.length} steps)
              {logOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {logOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{   height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3 rounded-xl border border-stone-100 bg-stone-50"
                >
                  <SystemLog steps={run.system_log} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Running state ──────────────────────────────────────────── */}
      {isRunning && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          {run.system_log?.length > 0 ? (
            <div className="w-full max-w-md">
              <p className="font-display font-extrabold text-2xl text-stone-900 text-center mb-2 tracking-tight">
                Axel is sourcing.
              </p>
              <p className="text-sm text-stone-400 text-center mb-8">
                Searching GitHub, analyzing signals, preparing your briefing.
              </p>
              <div className="rounded-xl border border-stone-100 bg-stone-50 overflow-hidden">
                <SystemLog steps={run.system_log} />
              </div>
            </div>
          ) : (
            <>
              <Spinner />
              <p className="text-stone-500 text-sm">Axel is sourcing.</p>
              <p className="text-stone-400 text-xs">This usually takes 30–60 seconds.</p>
            </>
          )}
        </div>
      )}

      {/* ── Pipeline columns ───────────────────────────────────────── */}
      {isDone && pipeline && (
        <>
          {totalMatched === 0 ? (
            <div className="text-center py-16 text-stone-500">
              <p className="text-lg font-semibold font-display mb-2">Nothing matched the criteria.</p>
              <p className="text-sm text-stone-400">Consider broadening constraints.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <PipelineColumn level="high"   candidates={pipeline.high}   colIndex={0} />
              <PipelineColumn level="medium" candidates={pipeline.medium} colIndex={1} />
              <PipelineColumn level="low"    candidates={pipeline.low}    colIndex={2} />
            </div>
          )}
        </>
      )}

      {/* ── Failed state ───────────────────────────────────────────── */}
      {run.status === 'failed' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <p className="font-semibold text-rose-700 mb-1">Pipeline failed</p>
          <p className="text-sm text-rose-500">{run.error ?? 'An unexpected error occurred.'}</p>
        </div>
      )}
    </div>
  );
}
