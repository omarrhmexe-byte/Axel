import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

// ─── Step definitions ─────────────────────────────────────────────────────────
export const CANVAS_STEPS = [
  {
    n:      '01',
    label:  'Role setup',
    detail: 'Axel ingests the role, company context, growth stage, budget, and hiring goals. Context is everything.',
    action: 'Parsing role context',
  },
  {
    n:      '02',
    label:  'Strategy',
    detail: 'A full hiring strategy is written — target companies, talent pool reasoning, comp analysis, and sourcing approach.',
    action: 'Generating hiring strategy',
  },
  {
    n:      '03',
    label:  'Approval',
    detail: 'You review the strategy and approve it. Axel doesn\'t source a single candidate until you greenlight the plan.',
    action: 'Awaiting approval',
  },
  {
    n:      '04',
    label:  'Sourcing',
    detail: 'GitHub, internal database, and LinkedIn are queried in parallel. 20–40 candidates identified in minutes.',
    action: 'Querying sources in parallel',
  },
  {
    n:      '05',
    label:  'Analysis',
    detail: 'Every candidate is analyzed: signals extracted, alignment assessed, confidence tier assigned. No blind scoring.',
    action: 'Analyzing candidate signals',
  },
  {
    n:      '06',
    label:  'Outreach',
    detail: 'Personalized outreach is drafted and sent. Each message references the candidate\'s actual background — not a template.',
    action: 'Drafting personalized outreach',
  },
  {
    n:      '07',
    label:  'Pipeline',
    detail: 'Responses flow in. Interested candidates enter your decision-ready pipeline with full briefings attached.',
    action: 'Building pipeline',
  },
  {
    n:      '08',
    label:  'Coordination',
    detail: 'Interviews are scheduled, briefings prepared for interviewers, decisions tracked. You show up, Axel runs the rest.',
    action: 'Scheduling and coordinating',
  },
] as const;

export type StepState = 'pending' | 'running' | 'done';

// ─── Node ─────────────────────────────────────────────────────────────────────
function StepNode({
  step,
  state,
}: {
  step:  (typeof CANVAS_STEPS)[number];
  state: StepState;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 shrink-0">
      {/* Circle */}
      <div className="relative">
        {/* Pulse ring — only when running */}
        {state === 'running' && (
          <motion.div
            animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-axel-500"
          />
        )}

        <div
          className={`
            relative w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-500 z-10
            ${state === 'done'    ? 'bg-axel-ink shadow-none'                              : ''}
            ${state === 'running' ? 'bg-axel-500 shadow-[0_0_24px_rgba(84,70,229,0.55)]'  : ''}
            ${state === 'pending' ? 'bg-white border-2 border-stone-200'                  : ''}
          `}
        >
          {state === 'done' && (
            <Check className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          )}
          {state === 'running' && (
            <motion.span
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="text-white font-mono text-[11px] font-bold"
            >
              {step.n}
            </motion.span>
          )}
          {state === 'pending' && (
            <span className="text-stone-400 font-mono text-[11px]">{step.n}</span>
          )}
        </div>
      </div>

      {/* Label */}
      <span
        className={`
          text-[10px] font-mono uppercase tracking-wider leading-tight text-center w-[64px]
          ${state === 'running' ? 'text-axel-500 font-semibold' : ''}
          ${state === 'done'    ? 'text-stone-700 font-medium'  : ''}
          ${state === 'pending' ? 'text-stone-400'              : ''}
        `}
      >
        {step.label}
      </span>
    </div>
  );
}

// ─── Connector line ───────────────────────────────────────────────────────────
function Connector({ filled, traveling }: { filled: boolean; traveling: boolean }) {
  return (
    <div className="relative flex-1 h-px bg-stone-200 mx-1 self-start mt-5">
      {/* Progress fill */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: filled ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: 'left center' }}
        className="absolute inset-0 bg-axel-500"
      />

      {/* Traveling particle */}
      <AnimatePresence>
        {traveling && (
          <motion.span
            key="particle"
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-axel-500 shadow-[0_0_8px_rgba(84,70,229,0.9)]"
            style={{ position: 'absolute' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Active step detail card ──────────────────────────────────────────────────
function StepDetail({ step, state }: { step: (typeof CANVAS_STEPS)[number]; state: StepState }) {
  return (
    <motion.div
      key={step.n}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, type: 'spring', stiffness: 320, damping: 32 }}
      className="flex items-start gap-4 bg-white rounded-xl border border-stone-200/70 px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
    >
      <div className="shrink-0 flex flex-col items-center pt-0.5">
        <span className="text-[10px] font-mono text-stone-400 leading-none mb-1">STEP</span>
        <span className="text-2xl font-display font-light text-stone-200 leading-none">{step.n}</span>
      </div>

      <div className="w-px self-stretch bg-stone-100" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-axel-500 font-semibold">
            {step.label}
          </span>
          {state === 'running' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-axel-500 inline-block"
              />
              {step.action}
            </span>
          )}
          {state === 'done' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <Check className="w-3 h-3" />
              Complete
            </span>
          )}
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">{step.detail}</p>
      </div>
    </motion.div>
  );
}

// ─── WorkflowCanvas ───────────────────────────────────────────────────────────
interface WorkflowCanvasProps {
  /** Auto-plays through all steps in a loop */
  demo?:             boolean;
  /** External control (for live dashboard use) */
  activeStep?:       number;
  completedSteps?:   number[];
  /** Spacing variant */
  compact?:          boolean;
  /** Hide the detail card */
  hideDetail?:       boolean;
}

export function WorkflowCanvas({
  demo            = false,
  activeStep:     externalActive,
  completedSteps: externalCompleted,
  compact         = false,
  hideDetail      = false,
}: WorkflowCanvasProps) {
  const [demoActive,    setDemoActive]    = useState(0);
  const [demoCompleted, setDemoCompleted] = useState<number[]>([]);
  const [cycleKey,      setCycleKey]      = useState(0);

  useEffect(() => {
    if (!demo) return;

    let stepIdx = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const advance = () => {
      setDemoActive(stepIdx);
      if (stepIdx > 0) {
        setDemoCompleted(prev => [...prev, stepIdx - 1]);
      }
      stepIdx++;

      if (stepIdx < CANVAS_STEPS.length) {
        timers.push(setTimeout(advance, 2400));
      } else {
        // Mark final step done, then reset
        timers.push(setTimeout(() => {
          setDemoCompleted(CANVAS_STEPS.map((_, i) => i));
        }, 1600));
        timers.push(setTimeout(() => {
          setDemoActive(0);
          setDemoCompleted([]);
          setCycleKey(k => k + 1);
        }, 3600));
      }
    };

    advance();
    return () => timers.forEach(clearTimeout);
  }, [demo, cycleKey]);

  const active    = demo ? demoActive    : (externalActive    ?? 0);
  const completed = demo ? demoCompleted : (externalCompleted ?? []);

  const getState = (i: number): StepState => {
    if (completed.includes(i)) return 'done';
    if (i === active)          return 'running';
    return 'pending';
  };

  const currentStep = CANVAS_STEPS[active];
  const currentState = getState(active);

  return (
    <div className={`w-full ${compact ? '' : ''}`}>
      {/* Canvas row */}
      <div className="overflow-x-auto -mx-1 px-1 pb-2">
        <div className="flex items-start min-w-[680px]">
          {CANVAS_STEPS.map((step, i) => (
            <div key={step.n} className="flex items-center flex-1">
              <StepNode step={step} state={getState(i)} />
              {i < CANVAS_STEPS.length - 1 && (
                <Connector
                  filled={completed.includes(i)}
                  traveling={i === active}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active step detail */}
      {!hideDetail && (
        <div className="mt-5">
          <AnimatePresence mode="wait">
            <StepDetail key={active} step={currentStep} state={currentState} />
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
