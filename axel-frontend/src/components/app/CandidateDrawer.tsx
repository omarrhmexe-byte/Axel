/**
 * CandidateDrawer — slide-out full detail panel.
 * Opens from the right when a kanban card is clicked.
 *
 * Shows: confidence, advisory, signals, risks, experience,
 *        outreach draft, and deep analysis trigger.
 * Actions handled here: full advisory refresh, deep analysis, outreach copy.
 */

import { useState }              from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Loader2, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  confidenceStyles, confidenceLabel, sourceLabel,
} from '../../lib/utils';
import { requestDeepAdvisory, generateOutreach } from '../../lib/api';
import type { PipelineCandidate, AdvisoryOutput, OutreachResult } from '../../types';
import type { CandidateStage } from '../../hooks/useStageStore';

interface Props {
  candidate: PipelineCandidate;
  roleId:    string;
  stage:     CandidateStage;
  onClose:   () => void;
}

export function CandidateDrawer({ candidate, roleId, stage, onClose }: Props) {
  const s = confidenceStyles[candidate.confidence];

  // Live-generated advisory (overrides pipeline advisory)
  const [advisory,        setAdvisory]        = useState<AdvisoryOutput | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryMode,    setAdvisoryMode]    = useState<'fast' | 'deep' | null>(null);

  // Outreach state
  const [outreach,        setOutreach]        = useState<OutreachResult | null>(null);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachOpen,    setOutreachOpen]    = useState(false);
  const [copied,          setCopied]          = useState(false);

  // Section visibility
  const [showSignals,  setShowSignals]  = useState(true);

  const displayAdvisory = advisory ?? candidate.advisory ?? null;

  async function runAdvisory(mode: 'fast' | 'deep') {
    setAdvisoryLoading(true);
    setAdvisoryMode(mode);
    try {
      const result = await requestDeepAdvisory(roleId, candidate.candidate_id, mode);
      setAdvisory(result.advisory);
    } finally {
      setAdvisoryLoading(false);
    }
  }

  async function handleOutreach() {
    setOutreachLoading(true);
    setOutreachOpen(true);
    try {
      const result = await generateOutreach(roleId, candidate.candidate_id);
      setOutreach(result);
    } finally {
      setOutreachLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-30"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-[520px] bg-stone-950 border-l border-stone-800 z-40 flex flex-col overflow-hidden"
      >

        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${s.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {confidenceLabel(candidate.confidence)}
              </span>
              {candidate.source && (
                <span className="text-[10px] font-mono text-stone-600">
                  {sourceLabel(candidate.source, candidate.derived_signals)}
                </span>
              )}
              <span className={`text-[10px] font-mono uppercase tracking-widest ${
                stage === 'shortlisted'   ? 'text-emerald-600' :
                stage === 'outreach_sent' ? 'text-amber-600'   :
                stage === 'responded'     ? 'text-sky-600'     :
                stage === 'interviewing'  ? 'text-violet-500'  :
                stage === 'hold'          ? 'text-stone-600'   :
                stage === 'rejected'      ? 'text-rose-700'    : 'text-stone-700'
              }`}>
                {stage.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-stone-100 truncate">
              {candidate.candidate_name}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5 truncate">
              {candidate.card?.headline ?? candidate.summary?.split('.')[0]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-stone-600 hover:text-stone-300 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* ── Advisory ─────────────────────────────────────────────── */}
          <section>
            <SectionLabel label={
              advisoryMode === 'deep' ? 'Analysis · Deep' :
              advisoryMode === 'fast' ? 'Analysis · Quick' : 'Analysis'
            } />

            {advisoryLoading ? (
              <div className="flex items-center gap-2 text-stone-600 text-sm py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                {advisoryMode === 'deep'
                  ? 'Running deep analysis… this takes 2–5 minutes.'
                  : 'Analysing…'}
              </div>
            ) : displayAdvisory ? (
              <div className="space-y-5">
                {displayAdvisory.why_interesting?.length > 0 && (
                  <div>
                    <SubLabel label="Why interesting" />
                    <ul className="space-y-1.5 mt-2">
                      {displayAdvisory.why_interesting.map((item, i) => (
                        <li key={i} className="text-sm text-stone-300 flex gap-2 leading-snug">
                          <span className="text-stone-700 shrink-0 mt-0.5 font-mono text-[10px]">→</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayAdvisory.risk_unknown?.length > 0 && (
                  <div>
                    <SubLabel label="Risk / Unknown" />
                    <ul className="space-y-1.5 mt-2">
                      {displayAdvisory.risk_unknown.map((risk, i) => (
                        <li key={i} className="text-sm text-stone-500 flex gap-2 leading-snug">
                          <span className="text-rose-900 shrink-0 mt-0.5">△</span>{risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayAdvisory.trajectory?.length > 0 && (
                  <div>
                    <SubLabel label="Trajectory" />
                    <ul className="space-y-1.5 mt-2">
                      {displayAdvisory.trajectory.map((line, i) => (
                        <li key={i} className="text-sm text-stone-400 flex gap-2 leading-snug">
                          <span className="text-sky-900 shrink-0 mt-0.5 font-mono text-[10px]">↗</span>{line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {displayAdvisory.question_to_ask && (
                  <div>
                    <SubLabel label="Ask before you call" />
                    <p className="mt-2 text-sm text-stone-300 bg-stone-900 border border-stone-800
                      border-l-2 border-l-amber-800 rounded-lg px-4 py-3 leading-relaxed">
                      {displayAdvisory.question_to_ask}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-600">
                No analysis yet. Run one below.
              </p>
            )}

            {/* Advisory actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => runAdvisory('fast')}
                disabled={advisoryLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300 disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                {displayAdvisory ? 'Refresh analysis' : 'Quick analysis'}
              </button>
              <button
                onClick={() => runAdvisory('deep')}
                disabled={advisoryLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300 disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-3 h-3 text-stone-400" />
                Full brief
              </button>
            </div>
            {advisoryMode === 'deep' && advisoryLoading && (
              <p className="text-xs text-stone-600 mt-2">
                Axel is doing a deep research pass on this company. Results are cached after the first run.
              </p>
            )}
          </section>

          {/* ── Signals & risks ──────────────────────────────────────── */}
          <section>
            <button
              onClick={() => setShowSignals(v => !v)}
              className="flex items-center gap-2 text-[10px] font-mono text-stone-600 uppercase tracking-widest hover:text-stone-400 transition-colors mb-4 w-full text-left"
            >
              Signals & fit
              {showSignals ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
              {showSignals && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Why they fit */}
                    {(candidate.card?.sections.alignment ?? candidate.match_reasons ?? []).length > 0 && (
                      <div>
                        <SubLabel label="Why they fit" />
                        <ul className="space-y-1.5">
                          {(candidate.card?.sections.alignment ?? candidate.match_reasons ?? []).map((r, i) => (
                            <li key={i} className="text-sm text-stone-400 flex gap-2">
                              <span className="text-emerald-800 shrink-0 mt-0.5">✓</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {(candidate.card?.sections.risks ?? candidate.concerns ?? []).length > 0 && (
                      <div>
                        <SubLabel label="Risks" />
                        <ul className="space-y-1.5">
                          {(candidate.card?.sections.risks ?? candidate.concerns ?? []).map((r, i) => (
                            <li key={i} className="text-sm text-stone-500 flex gap-2">
                              <span className="text-rose-800 shrink-0 mt-0.5">!</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Experience chips */}
                  {(candidate.card?.sections.experience ?? []).length > 0 && (
                    <div>
                      <SubLabel label="Experience signals" />
                      <div className="flex flex-wrap gap-1.5">
                        {(candidate.card?.sections.experience ?? []).map((e, i) => (
                          <span key={i} className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── Outreach ─────────────────────────────────────────────── */}
          <section>
            <SectionLabel label="Outreach" />

            {!outreachOpen ? (
              <button
                onClick={handleOutreach}
                className="text-xs text-stone-500 hover:text-stone-300 border border-stone-800 hover:border-stone-600 px-3 py-1.5 rounded-lg transition-all"
              >
                Generate outreach draft
              </button>
            ) : outreachLoading ? (
              <div className="flex items-center gap-2 text-stone-600 text-sm py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing…
              </div>
            ) : outreach ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-sm text-stone-300">{outreach.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest mb-2">Message</p>
                  <pre className="text-sm text-stone-400 whitespace-pre-wrap font-sans leading-relaxed bg-stone-900 rounded-lg p-4 border border-stone-800">
                    {outreach.body}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy(`Subject: ${outreach.subject}\n\n${outreach.body}`)}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy to clipboard'}
                  </button>
                  <button
                    onClick={handleOutreach}
                    className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-400">Failed. Try again.</p>
            )}
          </section>

        </div>
      </motion.div>
    </>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest mb-4">
      {label}
    </p>
  );
}

function SubLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-mono text-stone-700 uppercase tracking-widest mb-2">
      {label}
    </p>
  );
}
