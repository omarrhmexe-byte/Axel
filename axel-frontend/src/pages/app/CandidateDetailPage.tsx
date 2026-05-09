/**
 * CandidateDetailPage — /app/run/:runId/candidate/:candidateId
 * Full candidate brief + action controls.
 */
import { useState }          from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePipelineRun }    from '../../hooks/usePipelineRun';
import { AppShell }          from '../../components/app/AppShell';
import { reshapePipeline, confidenceStyles, confidenceLabel } from '../../lib/utils';
import { submitFeedback, requestDeepAdvisory, generateOutreach } from '../../lib/api';
import type { AdvisoryOutput, OutreachResult, FeedbackEventType } from '../../types';
import {
  CheckCircle2, XCircle, Pause, Sparkles, Mail,
  Loader2, ChevronDown, ChevronUp, Copy, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ActionState = 'idle' | 'loading' | 'done' | 'error';

export default function CandidateDetailPage() {
  const { runId, candidateId } = useParams<{ runId: string; candidateId: string }>();
  const [params]  = useSearchParams();
  const roleId    = params.get('role') ?? '';

  const { data }  = usePipelineRun(runId);
  const pipeline  = data?.pipeline ? reshapePipeline(data.pipeline) : null;
  const all       = pipeline ? [...pipeline.high, ...pipeline.medium, ...pipeline.low] : [];
  const candidate = all.find(c => c.candidate_id === candidateId);

  // Live advisory / outreach state (overrides what came in pipeline)
  const [advisory,  setAdvisory]  = useState<AdvisoryOutput | null>(null);
  const [outreach,  setOutreach]  = useState<OutreachResult | null>(null);
  const [deepMode,  setDeepMode]  = useState<'fast' | 'deep' | null>(null);
  const [actionSt,  setActionSt]  = useState<Record<string, ActionState>>({});
  const [feedback,  setFeedback]  = useState<FeedbackEventType | null>(null);

  // Section collapse state
  const [showSignals,  setShowSignals]  = useState(true);
  const [showOutreach, setShowOutreach] = useState(false);

  if (!candidate) {
    return (
      <AppShell back={{ label: 'Back to run', to: `/app/run/${runId}?role=${roleId}` }}>
        <div className="flex items-center justify-center h-full text-stone-600 text-sm py-20">
          Candidate not found. Make sure the pipeline has completed.
        </div>
      </AppShell>
    );
  }

  const displayAdvisory = advisory ?? candidate.advisory ?? null;
  const confidence      = candidate.confidence;
  const s               = confidenceStyles[confidence];

  // ── Actions ────────────────────────────────────────────────────────────────
  async function doFeedback(type: FeedbackEventType) {
    setActionSt(p => ({ ...p, [type]: 'loading' }));
    try {
      await submitFeedback(candidateId!, roleId, type);
      setFeedback(type);
      setActionSt(p => ({ ...p, [type]: 'done' }));
    } catch {
      setActionSt(p => ({ ...p, [type]: 'error' }));
    }
  }

  async function doDeepAdvisory(mode: 'fast' | 'deep') {
    setActionSt(p => ({ ...p, advisory: 'loading' }));
    setDeepMode(mode);
    try {
      const result = await requestDeepAdvisory(roleId, candidateId!, mode);
      setAdvisory(result.advisory);
      setActionSt(p => ({ ...p, advisory: 'done' }));
    } catch {
      setActionSt(p => ({ ...p, advisory: 'error' }));
    }
  }

  async function doOutreach() {
    setActionSt(p => ({ ...p, outreach: 'loading' }));
    setShowOutreach(true);
    try {
      const result = await generateOutreach(roleId, candidateId!);
      setOutreach(result);
      setActionSt(p => ({ ...p, outreach: 'done' }));
    } catch {
      setActionSt(p => ({ ...p, outreach: 'error' }));
    }
  }

  return (
    <AppShell
      back={{ label: 'Back to pipeline', to: `/app/run/${runId}?role=${roleId}` }}
      title={candidate.candidate_name}
    >
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${s.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {confidenceLabel(confidence)}
            </span>
            {candidate.source && (
              <span className="text-[10px] font-mono text-stone-600 uppercase tracking-widest">
                {candidate.source}
              </span>
            )}
            {feedback && (
              <span className={`text-[10px] font-mono uppercase tracking-widest ${
                feedback === 'advance' ? 'text-emerald-500' :
                feedback === 'reject'  ? 'text-rose-500' : 'text-amber-500'
              }`}>
                {feedback}d
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-stone-100">{candidate.candidate_name}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {candidate.card?.headline ?? candidate.summary}
          </p>
        </div>

        {/* ── Advisory ───────────────────────────────────────────────────── */}
        {displayAdvisory ? (
          <Section label={deepMode === 'deep' ? 'Analysis · Deep' : deepMode === 'fast' ? 'Analysis · Quick' : 'Analysis'}>

            {displayAdvisory.why_interesting?.length > 0 && (
              <SubSection label="Why interesting">
                <ul className="space-y-1.5">
                  {displayAdvisory.why_interesting.map((item, i) => (
                    <li key={i} className="text-sm text-stone-300 flex gap-2 leading-snug">
                      <span className="text-stone-700 shrink-0 mt-0.5 font-mono text-[10px]">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </SubSection>
            )}

            {displayAdvisory.risk_unknown?.length > 0 && (
              <SubSection label="Risk / Unknown">
                <ul className="space-y-1.5">
                  {displayAdvisory.risk_unknown.map((risk, i) => (
                    <li key={i} className="text-sm text-stone-500 flex gap-2 leading-snug">
                      <span className="text-rose-900 shrink-0 mt-0.5">△</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </SubSection>
            )}

            {displayAdvisory.trajectory?.length > 0 && (
              <SubSection label="Trajectory">
                <ul className="space-y-1.5">
                  {displayAdvisory.trajectory.map((line, i) => (
                    <li key={i} className="text-sm text-stone-400 flex gap-2 leading-snug">
                      <span className="text-sky-900 shrink-0 mt-0.5 font-mono text-[10px]">↗</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </SubSection>
            )}

            {displayAdvisory.question_to_ask && (
              <SubSection label="Ask before you call">
                <p className="text-sm text-stone-300 bg-stone-900 border border-stone-800
                  border-l-2 border-l-amber-800 rounded-lg px-4 py-3 leading-relaxed">
                  {displayAdvisory.question_to_ask}
                </p>
              </SubSection>
            )}
          </Section>
        ) : (
          <Section label="Advisory">
            <p className="text-sm text-stone-600">
              No advisory yet. Generate one below.
            </p>
          </Section>
        )}

        {/* ── Signals ────────────────────────────────────────────────────── */}
        <CollapsibleSection
          label="Signals & risks"
          open={showSignals}
          onToggle={() => setShowSignals(v => !v)}
        >
          <div className="grid grid-cols-2 gap-6">
            {candidate.card?.sections.alignment?.length ? (
              <SubSection label="Why they align">
                <ul className="space-y-1.5">
                  {candidate.card.sections.alignment.map((s, i) => (
                    <li key={i} className="text-sm text-stone-400 flex gap-2">
                      <span className="text-emerald-700 shrink-0 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </SubSection>
            ) : candidate.match_reasons?.length ? (
              <SubSection label="Why they align">
                <ul className="space-y-1.5">
                  {candidate.match_reasons.map((s, i) => (
                    <li key={i} className="text-sm text-stone-400 flex gap-2">
                      <span className="text-emerald-700 shrink-0 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </SubSection>
            ) : null}

            {candidate.card?.sections.risks?.length ? (
              <SubSection label="Risks / gaps">
                <ul className="space-y-1.5">
                  {candidate.card.sections.risks.map((r, i) => (
                    <li key={i} className="text-sm text-stone-500 flex gap-2">
                      <span className="text-rose-800 shrink-0 mt-0.5">!</span>{r}
                    </li>
                  ))}
                </ul>
              </SubSection>
            ) : candidate.concerns?.length ? (
              <SubSection label="Risks / gaps">
                <ul className="space-y-1.5">
                  {candidate.concerns.map((r, i) => (
                    <li key={i} className="text-sm text-stone-500 flex gap-2">
                      <span className="text-rose-800 shrink-0 mt-0.5">!</span>{r}
                    </li>
                  ))}
                </ul>
              </SubSection>
            ) : null}
          </div>

          {candidate.card?.sections.experience?.length ? (
            <SubSection label="Experience signals" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {candidate.card.sections.experience.map((e, i) => (
                  <span key={i} className="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded">
                    {e}
                  </span>
                ))}
              </div>
            </SubSection>
          ) : null}
        </CollapsibleSection>

        {/* ── Outreach ───────────────────────────────────────────────────── */}
        {showOutreach && (
          <CollapsibleSection
            label="Outreach draft"
            open
            onToggle={() => setShowOutreach(v => !v)}
          >
            {actionSt.outreach === 'loading' ? (
              <div className="flex items-center gap-2 text-stone-600 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Writing outreach…
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
                <CopyButton text={`Subject: ${outreach.subject}\n\n${outreach.body}`} />
              </div>
            ) : (
              <p className="text-sm text-rose-400">Failed to generate outreach. Try again.</p>
            )}
          </CollapsibleSection>
        )}

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="border-t border-stone-800 pt-6">
          <p className="text-[10px] font-mono text-stone-700 uppercase tracking-widest mb-4">Actions</p>
          <div className="flex flex-wrap gap-2">
            <ActionBtn
              label="Advance"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              variant="success"
              state={actionSt['advance']}
              disabled={!!feedback}
              onClick={() => doFeedback('advance')}
            />
            <ActionBtn
              label="Reject"
              icon={<XCircle className="w-3.5 h-3.5" />}
              variant="danger"
              state={actionSt['reject']}
              disabled={!!feedback}
              onClick={() => doFeedback('reject')}
            />
            <ActionBtn
              label="Hold"
              icon={<Pause className="w-3.5 h-3.5" />}
              variant="neutral"
              state={actionSt['thumbs_up']}
              disabled={!!feedback}
              onClick={() => doFeedback('thumbs_up')}
            />

            <div className="w-px h-8 bg-stone-800 mx-1 self-center" />

            <ActionBtn
              label="Quick analysis"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              variant="neutral"
              state={deepMode === 'fast' ? actionSt['advisory'] : 'idle'}
              onClick={() => doDeepAdvisory('fast')}
            />
            <ActionBtn
              label="Full brief"
              icon={<Sparkles className="w-3.5 h-3.5 text-stone-400" />}
              variant="neutral"
              state={deepMode === 'deep' ? actionSt['advisory'] : 'idle'}
              onClick={() => doDeepAdvisory('deep')}
            />
            <ActionBtn
              label={outreach ? 'Regenerate outreach' : 'Generate outreach'}
              icon={<Mail className="w-3.5 h-3.5" />}
              variant="neutral"
              state={actionSt['outreach']}
              onClick={doOutreach}
            />
          </div>
          {actionSt['advisory'] === 'loading' && (
            <p className="text-xs text-stone-600 mt-3">
              {deepMode === 'deep'
                ? 'Running deep analysis… this takes 2–5 minutes. Results are cached after the first run.'
                : 'Analysing…'}
            </p>
          )}
        </div>

      </div>
    </AppShell>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest mb-4">{label}</p>
      {children}
    </div>
  );
}

function SubSection({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-mono text-stone-700 uppercase tracking-widest mb-2">{label}</p>
      {children}
    </div>
  );
}

function CollapsibleSection({
  label, open, onToggle, children,
}: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-[10px] font-mono text-stone-600 uppercase tracking-widest mb-4 hover:text-stone-400 transition-colors w-full text-left"
      >
        {label}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  label, icon, variant, state, onClick, disabled,
}: {
  label: string; icon: React.ReactNode; variant: string;
  state: ActionState; onClick: () => void; disabled?: boolean;
}) {
  const base = 'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    success: 'border-emerald-800 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950 hover:border-emerald-600',
    danger:  'border-rose-900    text-rose-400    bg-rose-950/40    hover:bg-rose-950    hover:border-rose-700',
    neutral: 'border-stone-800   text-stone-400   bg-stone-900/50   hover:bg-stone-800   hover:border-stone-600',
    manus:   'border-violet-900  text-violet-400  bg-violet-950/40  hover:bg-violet-950  hover:border-violet-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || state === 'loading'}
      className={`${base} ${variants[variant] ?? variants.neutral}`}
    >
      {state === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {state === 'done'    ? `${label} ✓` : label}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-400 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy to clipboard'}
    </button>
  );
}
