/**
 * SignalDrawer — 4-dimension signal panel.
 * Slides in from the right when a CandidateTile is clicked.
 *
 * Dimensions:
 *   01 · Ambition Alignment  — what drives them vs. role trajectory
 *   02 · Talent Constraints  — how they operate (headhunting context)
 *   03 · Systems Alignment   — stack / industry fit
 *   04 · Decision Signals    — high-stakes moves they've already made
 *
 * Plus: advisory signals (why interesting / risk / question), outreach, deep brief trigger.
 */

import { useState }               from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Loader2, Sparkles,
} from 'lucide-react';
import { confidenceLabel, sourceLabel } from '../../lib/utils';
import { requestDeepAdvisory, generateOutreach, analyzeResponse } from '../../lib/api';
import type {
  PipelineCandidate, AdvisoryOutput, OutreachResult, ResponseAnalysisOutput,
} from '../../types';
import type { CandidateStage } from '../../hooks/useStageStore';

// ── Confidence styling ────────────────────────────────────────────────────────
const CONF: Record<string, { dot: string; label: string; border: string; accent: string }> = {
  high:   { dot: 'bg-emerald-500', label: 'text-emerald-600', border: 'border-emerald-900/40', accent: 'border-l-emerald-500' },
  medium: { dot: 'bg-amber-500',   label: 'text-amber-600',   border: 'border-amber-900/30',  accent: 'border-l-amber-500'   },
  low:    { dot: 'bg-violet-500',  label: 'text-violet-600',  border: 'border-violet-900/30', accent: 'border-l-violet-500'  },
};

const STAGE_COLOR: Record<string, string> = {
  shortlisted:   'text-emerald-600',
  outreach_sent: 'text-amber-600',
  responded:     'text-sky-600',
  interviewing:  'text-violet-500',
  hold:          'text-stone-600',
  rejected:      'text-rose-700',
  new:           'text-stone-700',
};

// ── Derive signal dimensions from candidate data ──────────────────────────────
function getAmbitionSignals(c: PipelineCandidate): string[] {
  const signals: string[] = [];
  if (c.motivation_signals?.length)         signals.push(...c.motivation_signals);
  if (c.card?.sections.motivation?.length)  signals.push(...c.card.sections.motivation);
  // dedupe
  return [...new Set(signals)].slice(0, 5);
}

function getTalentConstraints(c: PipelineCandidate): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const src = c.source;
  if (src === 'github') {
    items.push({ label: 'Discovery path', value: 'Active on GitHub — likely open to interesting work' });
    if (c.derived_signals?.open_source_activity === 'active') {
      items.push({ label: 'Signal quality', value: 'High OSS activity — visible work ethic' });
    }
    const complexity = c.derived_signals?.repo_complexity;
    if (complexity) {
      items.push({
        label: 'Code complexity',
        value: complexity === 'high' ? 'Handles complex systems — not just glue code'
             : complexity === 'medium' ? 'Solid day-to-day work, some complexity'
             : 'Lighter-weight repos so far',
      });
    }
    if (c.derived_signals?.primary_languages?.length) {
      items.push({
        label: 'Primary stack',
        value: c.derived_signals.primary_languages.join(', '),
      });
    }
  } else if (src === 'db') {
    items.push({ label: 'Discovery path', value: 'Sourced from network — passive candidate, needs warm approach' });
  } else if (src === 'linkedin') {
    items.push({ label: 'Discovery path', value: 'LinkedIn profile — may be open to opportunities' });
  }
  if (!items.length) {
    items.push({ label: 'Discovery path', value: 'Signal source not specified' });
  }
  return items;
}

function getSystemsAlignment(c: PipelineCandidate): string[] {
  const signals: string[] = [];
  if (c.derived_signals?.primary_languages?.length) {
    signals.push(...c.derived_signals.primary_languages);
  }
  if (c.card?.sections.experience?.length) signals.push(...c.card.sections.experience);
  return [...new Set(signals)].slice(0, 8);
}

function getDecisionSignals(c: PipelineCandidate): string[] {
  const signals: string[] = [];
  if (c.value_signals?.length)          signals.push(...c.value_signals);
  if (c.card?.sections.value?.length)   signals.push(...c.card.sections.value);
  return [...new Set(signals)].slice(0, 4);
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  candidate: PipelineCandidate;
  roleId:    string;
  stage:     CandidateStage;
  onClose:   () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SignalDrawer({ candidate, roleId, stage, onClose }: Props) {
  const conf = CONF[candidate.confidence] ?? CONF['medium'];

  // Advisory state
  const [advisory,        setAdvisory]        = useState<AdvisoryOutput | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryMode,    setAdvisoryMode]    = useState<'fast' | 'deep' | null>(null);

  // Outreach state
  const [outreach,        setOutreach]        = useState<OutreachResult | null>(null);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachOpen,    setOutreachOpen]    = useState(false);
  const [copied,          setCopied]          = useState(false);

  // Response analysis state
  const [responseText,      setResponseText]      = useState('');
  const [questionText,      setQuestionText]       = useState(
    candidate.advisory?.question_to_ask ?? '',
  );
  const [responseAnalysis,  setResponseAnalysis]  = useState<ResponseAnalysisOutput | null>(null);
  const [responseLoading,   setResponseLoading]   = useState(false);
  const [responseError,     setResponseError]     = useState('');

  const displayAdvisory = advisory ?? candidate.advisory ?? null;

  const ambitionSignals  = getAmbitionSignals(candidate);
  const talentConstraints = getTalentConstraints(candidate);
  const systemsAlignment  = getSystemsAlignment(candidate);
  const decisionSignals   = getDecisionSignals(candidate);

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

  async function runResponseAnalysis() {
    if (!responseText.trim() || !questionText.trim()) return;
    setResponseLoading(true);
    setResponseError('');
    try {
      const result = await analyzeResponse(
        roleId,
        candidate.candidate_id,
        questionText,
        responseText,
      );
      setResponseAnalysis(result.analysis);
    } catch (e) {
      setResponseError((e as Error).message ?? 'Analysis failed');
    } finally {
      setResponseLoading(false);
    }
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
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 w-[480px] bg-stone-950 border-l border-stone-800 z-40 flex flex-col overflow-hidden"
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={`px-6 py-5 border-b border-stone-800 border-l-4 ${conf.accent} shrink-0`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest ${conf.label}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                  {confidenceLabel(candidate.confidence)}
                </span>
                {candidate.source && (
                  <span className="text-[9px] font-mono text-stone-600">
                    {sourceLabel(candidate.source, candidate.derived_signals)}
                  </span>
                )}
                <span className={`text-[9px] font-mono uppercase tracking-widest ${STAGE_COLOR[stage] ?? 'text-stone-700'}`}>
                  {stage.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-stone-100 tracking-tight">
                {candidate.candidate_name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 truncate">
                {candidate.card?.headline ?? candidate.summary?.split('.')[0]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-stone-700 hover:text-stone-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Why interesting (advisory) ─────────────────────────────── */}
          {displayAdvisory?.why_interesting?.length > 0 && (
            <div className="px-6 py-5 border-b border-stone-800/60">
              <DimLabel text="Why interesting" />
              <ul className="space-y-2 mt-2.5">
                {displayAdvisory.why_interesting.map((signal, i) => (
                  <li key={i} className="text-[13px] text-stone-300 leading-snug flex gap-2.5">
                    <span className="text-stone-700 shrink-0 mt-0.5 font-mono text-[10px]">→</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── 4 Signal Dimensions ────────────────────────────────────── */}
          <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-stone-800/60">

            {/* 01 — Ambition Alignment */}
            <SignalBlock
              ordinal="01"
              label="Ambition Alignment"
              tooltip="What drives this person vs. the role's growth arc"
              color="text-emerald-700"
            >
              {ambitionSignals.length > 0 ? (
                <ul className="space-y-1.5">
                  {ambitionSignals.map((s, i) => (
                    <li key={i} className="text-[12px] text-stone-400 flex gap-1.5">
                      <span className="text-stone-700 shrink-0">·</span>{s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-stone-700">No motivation signals captured.</p>
              )}
            </SignalBlock>

            {/* 02 — Talent Constraints */}
            <SignalBlock
              ordinal="02"
              label="Talent Constraints"
              tooltip="How they operate — context for outreach approach"
              color="text-amber-700"
            >
              <ul className="space-y-2">
                {talentConstraints.map((item, i) => (
                  <li key={i}>
                    <p className="text-[9px] font-mono text-stone-700 uppercase tracking-wider">{item.label}</p>
                    <p className="text-[12px] text-stone-400 mt-0.5">{item.value}</p>
                  </li>
                ))}
              </ul>
            </SignalBlock>

            {/* 03 — Systems Alignment */}
            <SignalBlock
              ordinal="03"
              label="Systems Alignment"
              tooltip="Stack and domain fit for the role"
              color="text-sky-700"
            >
              {systemsAlignment.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {systemsAlignment.map((s, i) => (
                    <span key={i} className="text-[10px] bg-stone-800/80 text-stone-500 px-1.5 py-0.5 rounded font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-stone-700">No stack signals.</p>
              )}
            </SignalBlock>

            {/* 04 — Decision Signals */}
            <SignalBlock
              ordinal="04"
              label="Decision Signals"
              tooltip="High-stakes moves they have already made"
              color="text-violet-700"
            >
              {decisionSignals.length > 0 ? (
                <ul className="space-y-1.5">
                  {decisionSignals.map((s, i) => (
                    <li key={i} className="text-[12px] text-stone-400 flex gap-1.5">
                      <span className="text-stone-700 shrink-0">·</span>{s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-stone-700">No decision signals captured.</p>
              )}
            </SignalBlock>

          </div>

          {/* ── Risk / Unknown (advisory) ─────────────────────────────── */}
          {displayAdvisory?.risk_unknown?.length > 0 && (
            <div className="px-6 py-5 border-b border-stone-800/60">
              <DimLabel text="Risk / Unknown" />
              <ul className="space-y-2 mt-2.5">
                {displayAdvisory.risk_unknown.map((risk, i) => (
                  <li key={i} className="text-[12px] text-stone-500 leading-snug flex gap-2.5">
                    <span className="text-rose-900 shrink-0 mt-0.5 font-mono text-[10px]">△</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Trajectory (advisory) ─────────────────────────────────── */}
          {displayAdvisory?.trajectory?.length > 0 && (
            <div className="px-6 py-5 border-b border-stone-800/60">
              <DimLabel text="Trajectory" />
              <ul className="space-y-2 mt-2.5">
                {displayAdvisory.trajectory.map((line, i) => (
                  <li key={i} className="text-[12px] text-stone-400 leading-snug flex gap-2.5">
                    <span className="text-sky-900 shrink-0 mt-0.5 font-mono text-[10px]">↗</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Question to ask (advisory) ─────────────────────────────── */}
          {displayAdvisory?.question_to_ask && (
            <div className="px-6 py-5 border-b border-stone-800/60">
              <DimLabel text="Ask before you call" />
              <p className="mt-2.5 text-[13px] text-stone-300 leading-relaxed
                bg-stone-900/60 border border-stone-800 rounded-xl px-4 py-3
                border-l-2 border-l-amber-800">
                {displayAdvisory.question_to_ask}
              </p>
            </div>
          )}

          {/* ── Match signals (pipeline data) ──────────────────────────── */}
          {(candidate.card?.sections.alignment ?? candidate.match_reasons ?? []).length > 0 && (
            <div className="px-6 py-5 border-b border-stone-800/60">
              <DimLabel text="Match signals" />
              <ul className="space-y-1.5 mt-2">
                {(candidate.card?.sections.alignment ?? candidate.match_reasons ?? []).map((r, i) => (
                  <li key={i} className="text-[12px] text-stone-400 flex gap-2">
                    <span className="text-emerald-800 shrink-0 mt-0.5">✓</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Advisory actions ───────────────────────────────────────── */}
          <div className="px-6 py-5 border-b border-stone-800/60">
            <DimLabel text={
              advisoryMode === 'deep' ? 'Analysis · deep'
              : advisoryMode === 'fast' ? 'Analysis · quick'
              : 'Analysis'
            } />

            {advisoryLoading ? (
              <div className="flex items-center gap-2 text-stone-600 text-xs py-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {advisoryMode === 'deep'
                  ? 'Running deep research pass — 2–5 min'
                  : 'Analysing…'}
              </div>
            ) : !displayAdvisory ? (
              <p className="text-xs text-stone-700 py-1">No analysis yet.</p>
            ) : null}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => runAdvisory('fast')}
                disabled={advisoryLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-800 text-stone-500
                  hover:border-stone-600 hover:text-stone-300 disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                {displayAdvisory ? 'Refresh' : 'Quick analysis'}
              </button>
              <button
                onClick={() => runAdvisory('deep')}
                disabled={advisoryLoading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-800 text-stone-500
                  hover:border-stone-600 hover:text-stone-300 disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                Full brief
              </button>
            </div>
            {advisoryMode === 'deep' && advisoryLoading && (
              <p className="text-[10px] text-stone-700 mt-2">
                Deep research pass in progress. Cached after first run.
              </p>
            )}
          </div>

          {/* ── Response analysis (responded stage only) ───────────────── */}
          {stage === 'responded' && (
            <div className="px-6 py-5 border-b border-stone-800/60">
              <DimLabel text="Response analysis" />

              {/* Show analysis result if available */}
              {responseAnalysis ? (
                <div className="mt-3 space-y-4">
                  {/* Signal quality badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      responseAnalysis.signal_quality === 'strong'
                        ? 'border-emerald-800 text-emerald-600'
                        : responseAnalysis.signal_quality === 'medium'
                        ? 'border-amber-800 text-amber-600'
                        : 'border-stone-700 text-stone-500'
                    }`}>
                      {responseAnalysis.signal_quality} signal
                    </span>
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      responseAnalysis.decision === 'move_to_call'
                        ? 'border-emerald-800 text-emerald-600'
                        : responseAnalysis.decision === 'ask_followup'
                        ? 'border-amber-800 text-amber-600'
                        : 'border-rose-900 text-rose-700'
                    }`}>
                      {responseAnalysis.decision.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Decision reason */}
                  <p className="text-[12px] text-stone-400 leading-snug italic">
                    {responseAnalysis.decision_reason}
                  </p>

                  {/* What we learned */}
                  {responseAnalysis.what_we_learned.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono text-stone-700 uppercase tracking-widest mb-1.5">
                        What we learned
                      </p>
                      <ul className="space-y-1.5">
                        {responseAnalysis.what_we_learned.map((item, i) => (
                          <li key={i} className="text-[12px] text-stone-300 flex gap-2 leading-snug">
                            <span className="text-stone-700 shrink-0 mt-0.5 font-mono text-[10px]">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What's still unclear */}
                  {responseAnalysis.what_is_unclear.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono text-stone-700 uppercase tracking-widest mb-1.5">
                        Still unclear
                      </p>
                      <ul className="space-y-1.5">
                        {responseAnalysis.what_is_unclear.map((item, i) => (
                          <li key={i} className="text-[12px] text-stone-500 flex gap-2 leading-snug">
                            <span className="text-stone-700 shrink-0 mt-0.5 font-mono text-[10px]">?</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => setResponseAnalysis(null)}
                    className="text-[10px] text-stone-700 hover:text-stone-500 transition-colors"
                  >
                    Analyse a different response
                  </button>
                </div>

              ) : (
                // Input form
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-[9px] font-mono text-stone-700 uppercase tracking-widest mb-1.5">
                      Question you asked
                    </p>
                    <textarea
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      rows={2}
                      placeholder="The question from your outreach…"
                      className="w-full bg-stone-900/60 border border-stone-800 rounded-lg px-3 py-2
                        text-[12px] text-stone-300 placeholder:text-stone-700
                        focus:outline-none focus:border-stone-600 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-mono text-stone-700 uppercase tracking-widest mb-1.5">
                      Their response
                    </p>
                    <textarea
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      rows={4}
                      placeholder="Paste what they wrote…"
                      className="w-full bg-stone-900/60 border border-stone-800 rounded-lg px-3 py-2
                        text-[12px] text-stone-300 placeholder:text-stone-700
                        focus:outline-none focus:border-stone-600 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {responseError && (
                    <p className="text-[11px] text-rose-400">{responseError}</p>
                  )}

                  <button
                    onClick={runResponseAnalysis}
                    disabled={responseLoading || !responseText.trim() || !questionText.trim()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                      border border-stone-800 text-stone-500
                      hover:border-stone-600 hover:text-stone-300
                      disabled:opacity-40 transition-all"
                  >
                    {responseLoading
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Analysing…</>
                      : 'Analyse response'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Outreach ───────────────────────────────────────────────── */}
          <div className="px-6 py-5">
            <DimLabel text="Outreach" />
            <div className="mt-3">
              {!outreachOpen ? (
                <button
                  onClick={handleOutreach}
                  className="text-xs text-stone-500 hover:text-stone-300 border border-stone-800 hover:border-stone-600 px-3 py-1.5 rounded-lg transition-all"
                >
                  Write outreach draft
                </button>
              ) : outreachLoading ? (
                <div className="flex items-center gap-2 text-stone-600 text-xs py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting…
                </div>
              ) : outreach ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-mono text-stone-700 uppercase tracking-widest mb-1">Subject</p>
                    <p className="text-xs text-stone-300">{outreach.subject}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-stone-700 uppercase tracking-widest mb-2">Message</p>
                    <pre className="text-xs text-stone-400 whitespace-pre-wrap font-sans leading-relaxed
                      bg-stone-900 rounded-lg p-3.5 border border-stone-800">
                      {outreach.body}
                    </pre>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopy(`Subject: ${outreach.subject}\n\n${outreach.body}`)}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                        : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
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
                <p className="text-xs text-rose-400">Failed to generate. Try again.</p>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}

// ── SignalBlock ───────────────────────────────────────────────────────────────
function SignalBlock({
  ordinal, label, color, children,
}: {
  ordinal: string;
  label:   string;
  tooltip: string;
  color:   string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-3.5">
      <div className="flex items-baseline gap-1.5 mb-2.5">
        <span className={`text-[9px] font-mono ${color} tracking-widest`}>{ordinal}</span>
        <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ── DimLabel ─────────────────────────────────────────────────────────────────
function DimLabel({ text }: { text: string }) {
  return (
    <p className="text-[9px] font-mono text-stone-600 uppercase tracking-widest">{text}</p>
  );
}

