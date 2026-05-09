/**
 * RunPage — /app/run/:runId
 * The main operator board.
 *
 * Layout:
 *   Left sidebar  — live pipeline progress (collapsible)
 *   Main area     — stage tabs + 2-3 col grid of CandidateTile
 *   Right panel   — SignalDrawer (slides in on tile click)
 *
 * Stage flow: Incoming → Shortlisted → Outreach Sent → Responded → Interviewing
 * Rejected / Hold are archived — visible under a separate tab.
 */

import { useState }              from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion }    from 'framer-motion';
import {
  CheckCircle2, Circle, Loader2, AlertCircle,
  PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { usePipelineRun }        from '../../hooks/usePipelineRun';
import { useStageStore }         from '../../hooks/useStageStore';
import { reshapePipeline }       from '../../lib/utils';
import { CandidateTile }         from '../../components/app/CandidateTile';
import { SignalDrawer }          from '../../components/app/SignalDrawer';
import { AppShell }              from '../../components/app/AppShell';
import type { PipelineCandidate, WorkflowStep } from '../../types';
import type { CandidateStage }   from '../../hooks/useStageStore';

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS: {
  id:     CandidateStage | 'archived';
  label:  string;
  stages: CandidateStage[];
}[] = [
  { id: 'new',           label: 'Incoming',     stages: ['new']          },
  { id: 'shortlisted',   label: 'Shortlisted',  stages: ['shortlisted']  },
  { id: 'outreach_sent', label: 'Outreach',     stages: ['outreach_sent']},
  { id: 'responded',     label: 'Responded',    stages: ['responded']    },
  { id: 'interviewing',  label: 'Interviewing', stages: ['interviewing'] },
  { id: 'archived',      label: 'Archived',     stages: ['hold', 'rejected'] },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function RunPage() {
  const { runId }   = useParams<{ runId: string }>();
  const [params]    = useSearchParams();
  const roleId      = params.get('role') ?? '';

  const { data, isLoading, error } = usePipelineRun(runId);
  const { getStage, updateStage }  = useStageStore(roleId);

  const pipeline      = data?.pipeline ? reshapePipeline(data.pipeline) : null;
  const allCandidates: PipelineCandidate[] = pipeline
    ? [...pipeline.high, ...pipeline.medium, ...pipeline.low]
    : [];

  const status    = data?.status   ?? 'pending';
  const headline  = data?.headline ?? '';
  const steps     = data?.system_log ?? [];
  const title     = data?.role_intelligence?.role_summary?.split('.')[0] ?? 'Pipeline run';

  // ── UI state ─────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab,   setActiveTab]   = useState<CandidateStage | 'archived'>('new');
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const selectedCandidate = selectedId
    ? allCandidates.find(c => c.candidate_id === selectedId) ?? null
    : null;

  // Get candidates for a given tab
  function getCandidatesForTab(tab: typeof TABS[number]): PipelineCandidate[] {
    return allCandidates.filter(c => (tab.stages as string[]).includes(getStage(c.candidate_id)));
  }

  // Count for badge
  function getTabCount(tab: typeof TABS[number]): number {
    return getCandidatesForTab(tab).length;
  }

  const activeTabConfig = TABS.find(t => t.id === activeTab) ?? TABS[0];
  const visibleCandidates = getCandidatesForTab(activeTabConfig);

  const isRunning = status === 'pending' || status === 'running';

  return (
    <AppShell
      title={title}
      subtitle={runId ? `· ${runId.slice(0, 8)}` : undefined}
      action={<StatusChip status={status} />}
      back={{ label: 'New run', to: '/app/new' }}
    >
      <div className="flex h-[calc(100vh-49px)] overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="shrink-0 border-r border-stone-800 flex flex-col overflow-hidden"
            >
              <div className="px-4 py-4 border-b border-stone-800 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-stone-600 uppercase tracking-widest mb-1">
                    Pipeline log
                  </p>
                  {headline && (
                    <p className="text-xs text-stone-500 leading-relaxed">{headline}</p>
                  )}
                  {!headline && status === 'pending' && (
                    <p className="text-xs text-stone-700">Starting…</p>
                  )}
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-stone-700 hover:text-stone-400 transition-colors shrink-0 mt-0.5"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3">
                {isLoading && !steps.length && (
                  <p className="text-xs text-stone-700 py-2">Connecting…</p>
                )}
                {steps.map((step, i) => (
                  <StepRow key={`${step.step}-${i}`} step={step} />
                ))}
              </div>

              {error && (
                <div className="px-4 py-3 border-t border-stone-800">
                  <p className="text-[11px] text-rose-400">{(error as Error).message}</p>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar toggle (collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 border-r border-stone-800 px-2 flex items-start pt-4 text-stone-700 hover:text-stone-400 transition-colors"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* ── Main: stage tabs + tile grid ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Stage tabs */}
          <div className="shrink-0 border-b border-stone-800 px-5 flex items-end gap-0.5 overflow-x-auto">
            {TABS.map(tab => {
              const count   = getTabCount(tab);
              const active  = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-medium shrink-0 border-b-2 transition-all ${
                    active
                      ? 'border-stone-300 text-stone-200'
                      : 'border-transparent text-stone-600 hover:text-stone-400'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-stone-700 text-stone-300' : 'bg-stone-800/80 text-stone-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tile grid */}
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* Running skeleton — Incoming tab only */}
            {activeTab === 'new' && isRunning && visibleCandidates.length === 0 && (
              <div>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                      className="bg-stone-900/40 border border-stone-800 rounded-2xl h-36"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-stone-700 text-center font-mono">
                  {status === 'pending' ? 'Starting pipeline…' : 'Axel is sourcing…'}
                </p>
              </div>
            )}

            {/* Empty state (non-incoming or completed with nothing) */}
            {visibleCandidates.length === 0 && !(activeTab === 'new' && isRunning) && (
              <p className="text-[11px] text-stone-700 py-10 text-center font-mono">
                {activeTab === 'new' && status === 'failed'
                  ? 'Pipeline failed — check the log.'
                  : 'None in this stage.'}
              </p>
            )}

            {/* Failed alert — Incoming tab */}
            {activeTab === 'new' && status === 'failed' && (
              <div className="flex items-start gap-2 bg-rose-950/20 border border-rose-900/30 rounded-xl p-3.5 mb-4 max-w-sm">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-400">Pipeline failed. Check the log on the left.</p>
              </div>
            )}

            {/* Candidate tiles */}
            <AnimatePresence>
              {visibleCandidates.length > 0 && (
                <motion.div
                  className="grid grid-cols-2 xl:grid-cols-3 gap-3"
                >
                  <AnimatePresence>
                    {visibleCandidates.map((c, i) => (
                      <CandidateTile
                        key={c.candidate_id}
                        candidate={c}
                        stage={getStage(c.candidate_id)}
                        roleId={roleId}
                        index={i}
                        onStage={stage => updateStage(c.candidate_id, stage)}
                        onOpen={() => setSelectedId(c.candidate_id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ── Signal drawer ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedCandidate && (
            <SignalDrawer
              key={selectedCandidate.candidate_id}
              candidate={selectedCandidate}
              roleId={roleId}
              stage={getStage(selectedCandidate.candidate_id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </AppShell>
  );
}

// ── StepRow ───────────────────────────────────────────────────────────────────
function StepRow({ step }: { step: WorkflowStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 py-2 border-b border-stone-800/30 last:border-0"
    >
      <div className="mt-0.5 shrink-0">
        {step.status === 'done'    && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
        {step.status === 'running' && <Loader2      className="w-3 h-3 text-amber-500 animate-spin" />}
        {step.status === 'error'   && <AlertCircle  className="w-3 h-3 text-rose-500" />}
        {step.status === 'pending' && <Circle       className="w-3 h-3 text-stone-800" />}
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] leading-snug ${
          step.status === 'done'    ? 'text-stone-600' :
          step.status === 'running' ? 'text-stone-300' :
          step.status === 'error'   ? 'text-rose-400'  : 'text-stone-700'
        }`}>
          {step.message}
        </p>
        {step.meta && Object.keys(step.meta).length > 0 && (
          <p className="text-[9px] text-stone-700 mt-0.5 font-mono">
            {Object.entries(step.meta).map(([k, v]) => `${k}: ${v}`).join(' · ')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── StatusChip ────────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; text: string }> = {
    pending:   { label: 'Starting',       dot: 'bg-stone-600 animate-pulse', text: 'text-stone-500' },
    running:   { label: 'Sourcing',       dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400' },
    completed: { label: 'Briefing ready', dot: 'bg-emerald-500',             text: 'text-emerald-500' },
    failed:    { label: 'Failed',         dot: 'bg-rose-500',                text: 'text-rose-400'   },
  };
  const s = map[status] ?? map['pending'];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className={`text-[10px] font-mono uppercase tracking-widest ${s.text}`}>{s.label}</span>
    </div>
  );
}
