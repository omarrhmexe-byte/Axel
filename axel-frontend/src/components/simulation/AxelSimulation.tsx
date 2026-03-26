/**
 * AxelSimulation — Full-screen autonomous recruiting simulation.
 * A living product demo, not a landing page.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Check, ArrowRight, RotateCcw,
  Github, Database, CheckCircle2, Loader2,
} from 'lucide-react';

// ─── User inputs ──────────────────────────────────────────────────────────────
interface UserInputs {
  role:     string;
  company:  string;
  location: string;
  budget:   string;
}

const DEFAULT_INPUTS: UserInputs = {
  role:     'Building payments infrastructure from scratch',
  company:  'Acme Corp · Series A · 45 people',
  location: 'Bangalore, India',
  budget:   '₹30–40 LPA',
};

// ─── Phase config ─────────────────────────────────────────────────────────────
const PHASES = [
  { id: 0, label: 'Context',    status: 'Understanding what you are building',       ms: 4200  },
  { id: 1, label: 'Meaning',    status: 'Understanding what matters here',           ms: 7500  },
  { id: 2, label: 'Profiles',   status: 'Bringing candidates in as profiles',        ms: 5500  },
  { id: 3, label: 'Signals',    status: 'Extracting signals — not scores',           ms: 7000  },
  { id: 4, label: 'Viewpoint',  status: 'Forming a point of view',                  ms: 6500  },
  { id: 5, label: 'Outreach',   status: 'Acting with context',                      ms: 6000  },
  { id: 6, label: 'Learning',   status: 'Learning from outcomes',                   ms: 99999 },
] as const;

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(
  text: string,
  speed = 22,
  active = false,
  startDelay = 0,
) {
  const [out, setOut] = useState('');

  useEffect(() => {
    if (!active) { setOut(''); return; }
    let cancelled = false;
    const t0 = setTimeout(() => {
      let i = 0;
      const tick = setInterval(() => {
        if (cancelled) { clearInterval(tick); return; }
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(tick);
      }, speed);
      return () => clearInterval(tick);
    }, startDelay);
    return () => { cancelled = true; clearTimeout(t0); };
  }, [text, speed, active, startDelay]);

  return out;
}

// ─── Shared scene wrapper ─────────────────────────────────────────────────────
function Scene({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute inset-0 flex items-center justify-center p-6 lg:p-12 ${className}`}
    >
      <div className="w-full max-w-[680px]">{children}</div>
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/30 mb-1.5">
      {children}
    </p>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.04] border border-white/[0.08] rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// ─── Scene 0: Role input ──────────────────────────────────────────────────────
const FIELD_DELAYS = [300, 1200, 2100, 2700] as const;

function FieldRow({ label, value, active }: { label: string; value: string; active: boolean }) {
  const typed = useTypewriter(value, 26, active, 120);
  const done  = typed.length >= value.length;
  return (
    <div className="border-b border-white/[0.06] py-3 flex gap-4">
      <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/90 font-light">
        {typed}
        {!done && active && <span className="animate-pulse text-axel-400">▍</span>}
      </span>
    </div>
  );
}

function RoleInputScene({ active, inputs }: { active: boolean; inputs: UserInputs }) {
  const [vis,  setVis]  = useState(0);
  const [done, setDone] = useState(false);

  const fields = [
    { label: 'Building',      value: inputs.role     },
    { label: 'Who you are',   value: inputs.company  },
    { label: 'Where',         value: inputs.location },
    { label: 'Compensation',  value: inputs.budget   },
  ];

  useEffect(() => {
    if (!active) { setVis(0); setDone(false); return; }
    const ts = FIELD_DELAYS.map((delay, i) => setTimeout(() => setVis(i + 1), delay));
    const td = setTimeout(() => setDone(true), 3700);
    return () => { ts.forEach(clearTimeout); clearTimeout(td); };
  }, [active]);

  return (
    <Scene>
      <Label>Tell Axel what you are trying to build</Label>
      <h2 className="text-3xl font-extrabold font-display text-white tracking-tight mb-6">
        Understanding context.
      </h2>

      <Card className="overflow-hidden mb-5">
        <div className="px-5 py-1">
          {fields.map((f, i) => (
            <FieldRow key={f.label} label={f.label} value={f.value} active={i < vis} />
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            Context captured — understanding what matters
          </motion.div>
        )}
      </AnimatePresence>
    </Scene>
  );
}

// ─── Scene 1: Strategy ────────────────────────────────────────────────────────
const STRATEGY_TEXT =
  'The right engineer here has shipped at scale and still wants to own the outcome — not just execute, but decide. Focus on those who have moved from shipping features to shaping systems. The context you are offering is the pitch: ownership over hierarchy, impact over title.';

const TALENT_TEXT =
  'What you are offering is not compensation. It is the chance to build something that matters at an early enough stage to define it. The engineers you want are asking one question: where can I go that will change my career?';

const COMPANIES = ['Razorpay', 'Chargebee', 'Hasura', 'Postman', 'Nilenso'];

function StrategyScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 3400),
      setTimeout(() => setStep(3), 5400),
      setTimeout(() => setStep(4), 7000),
    ];
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const stratText  = useTypewriter(STRATEGY_TEXT,  16, step >= 1, 0);
  const talentText = useTypewriter(TALENT_TEXT,     16, step >= 2, 0);

  return (
    <Scene>
      <div className="flex items-center gap-2 mb-5">
        <Label>What matters here</Label>
        {step < 4 && step > 0 && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-axel-500 inline-block mb-1.5"
          />
        )}
      </div>

      <div className="space-y-4">
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <Label>Sourcing focus</Label>
              <p className="text-sm text-white/80 leading-relaxed font-light">
                {stratText}
                {stratText.length < STRATEGY_TEXT.length && (
                  <span className="animate-pulse text-axel-400">▍</span>
                )}
              </p>
            </Card>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <Label>Target companies</Label>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.map((c, i) => (
                  <motion.span
                    key={c}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                    className="px-2.5 py-1 bg-axel-500/20 border border-axel-500/40 rounded-lg text-xs text-axel-300 font-medium"
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <Label>Talent pool reasoning</Label>
              <p className="text-sm text-white/80 leading-relaxed font-light">
                {talentText}
                {talentText.length < TALENT_TEXT.length && (
                  <span className="animate-pulse text-axel-400">▍</span>
                )}
              </p>
            </Card>
          </motion.div>
        )}

        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            Context understood — bringing in profiles
          </motion.div>
        )}
      </div>
    </Scene>
  );
}

// ─── Scene 2: Sourcing ────────────────────────────────────────────────────────
const SOURCES = [
  { label: 'GitHub queries',    Icon: Github,   count: 9,  total: 9,  color: 'bg-axel-500',   delay: 400  },
  { label: 'Internal database', Icon: Database, count: 23, total: 23, color: 'bg-emerald-500', delay: 1000 },
  { label: 'LinkedIn passive',  Icon: Database, count: 4,  total: 4,  color: 'bg-amber-500',   delay: 1700 },
] as const;

const SOURCED_NAMES = [
  { name: 'Arjun M.',  conf: 'Strong context fit',      cls: 'border-emerald-500/60 text-emerald-400', delay: 2800 },
  { name: 'Priya V.',  conf: 'Relevant background',     cls: 'border-amber-500/60 text-amber-400',     delay: 3200 },
  { name: 'Karan S.',  conf: 'Worth a conversation',    cls: 'border-violet-500/60 text-violet-400',   delay: 3600 },
  { name: 'Meera R.',  conf: 'Relevant background',     cls: 'border-amber-500/60 text-amber-400',     delay: 3900 },
  { name: 'Adit P.',   conf: 'Worth a conversation',    cls: 'border-violet-500/60 text-violet-400',   delay: 4200 },
] as const;

function SourceBar({ source, active }: { source: typeof SOURCES[number]; active: boolean }) {
  const Icon = source.Icon;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="text-xs text-white/50 w-36 shrink-0">{source.label}</span>
          <div className="flex-1 h-0.5 bg-white/[0.07] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className={`h-full rounded-full ${source.color}`}
            />
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-xs text-white/60 w-12 text-right shrink-0"
          >
            {source.count}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SourcingScene({ active }: { active: boolean }) {
  const [vis, setVis] = useState<number[]>([]);

  useEffect(() => {
    if (!active) { setVis([]); return; }
    const ts = [
      ...SOURCES.map((s, i) => setTimeout(() => setVis(v => [...v, i]), s.delay)),
      ...SOURCED_NAMES.map((s, i) => setTimeout(() => setVis(v => [...v, SOURCES.length + i]), s.delay)),
    ];
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const sourcesVis  = SOURCES.filter((_, i) => vis.includes(i));
  const namesVis    = SOURCED_NAMES.filter((_, i) => vis.includes(SOURCES.length + i));
  const total       = sourcesVis.reduce((a, s) => a + s.count, 0);

  return (
    <Scene>
      <Label>Candidates entering as profiles</Label>
      <h2 className="text-3xl font-extrabold font-display text-white tracking-tight mb-6">
        Not resumes. Profiles.
      </h2>

      <Card className="p-5 mb-4 space-y-4">
        {SOURCES.map((s, i) => (
          <SourceBar key={s.label} source={s} active={vis.includes(i)} />
        ))}
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs"
          >
            <span className="text-white/40 font-mono uppercase tracking-wider">Total found</span>
            <span className="text-white font-bold">{total}</span>
          </motion.div>
        )}
      </Card>

      {namesVis.length > 0 && (
        <div>
          <Label>Matched candidates</Label>
          <div className="grid grid-cols-5 gap-2">
            {SOURCED_NAMES.map((n, i) => (
              <AnimatePresence key={n.name}>
                {vis.includes(SOURCES.length + i) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className={`bg-white/[0.04] border rounded-lg p-2.5 text-center ${n.cls}`}
                  >
                    <p className="text-xs text-white/80 font-semibold mb-0.5">{n.name}</p>
                    <p className={`text-[9px] font-mono ${n.cls.split(' ')[1]}`}>{n.conf}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>
      )}
    </Scene>
  );
}

// ─── Scene 3: Analysis ────────────────────────────────────────────────────────
const SIGNALS = [
  { n: '01', text: 'Led zero-downtime payment infra migration — ₹100M+ daily volume. Owned the decision, not just the execution.', delay: 800  },
  { n: '02', text: 'On-call ownership across 5 postmortems. Writes about what broke and why — that is rare.',                       delay: 2400 },
  { n: '03', text: 'OSS contributor in payment tooling. 3.2k stars. Ships outside of work because he cares.',                       delay: 3800 },
] as const;

const WHY_NOW_TEXT = 'Three years at one company at this stage usually means they have learned everything they came to learn. The ambition is visible in what he has built. What he needs next is not a job — it is a problem worth solving. This might be it.';

function AnalysisScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 300),
      ...SIGNALS.map(s => setTimeout(() => setStep(SIGNALS.indexOf(s) + 2), s.delay)),
      setTimeout(() => setStep(SIGNALS.length + 2), 5400),
      setTimeout(() => setStep(SIGNALS.length + 3), 6500),
    ];
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const whyNow = useTypewriter(WHY_NOW_TEXT, 18, step >= SIGNALS.length + 2, 0);

  return (
    <Scene>
      <Label>Reading context · Arjun Mehta</Label>
      <h2 className="text-3xl font-extrabold font-display text-white tracking-tight mb-5">
        Signals. Not scores.
      </h2>

      <div className="space-y-3">

        {/* Signal extraction */}
        <Card className="p-4">
          <Label>Signals</Label>
          <div className="space-y-3">
            {SIGNALS.map((s, i) => (
              <AnimatePresence key={s.n}>
                {step >= i + 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className="flex items-start gap-3"
                  >
                    <span className="font-mono text-[11px] text-axel-400 shrink-0 pt-px">{s.n}</span>
                    <p className="text-sm text-white/80 font-light leading-snug">{s.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
            {step < 2 && (
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Extracting signals...
              </div>
            )}
          </div>
        </Card>

        {/* Confidence */}
        {step >= SIGNALS.length + 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <Label>Why now · Why this company</Label>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '88%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <span className="text-xs font-semibold text-emerald-400 shrink-0">Strong context fit</span>
              </div>
              <p className="text-xs text-white/80 font-light leading-relaxed">{whyNow}
                {whyNow.length < WHY_NOW_TEXT.length && (
                  <span className="animate-pulse text-axel-400">▍</span>
                )}
              </p>
            </Card>
          </motion.div>
        )}

        {step >= SIGNALS.length + 3 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            Signals read — forming a point of view
          </motion.div>
        )}
      </div>
    </Scene>
  );
}

// ─── Scene 4: Advisory ────────────────────────────────────────────────────────
const QUICK_TAKE = 'Arjun is not looking for a job. He is looking for the right problem at the right moment. His trajectory points toward ownership — and you are early enough that he could actually define the system. That is rare.';

const ADD_VALUE = [
  'Has owned systems at scale — not just contributed to them',
  'Writes publicly about what broke and why. That is the kind of thinking that shapes engineering culture',
  'At the exact inflection point where ambition exceeds what Razorpay can offer him next',
];

const OPEN_QS = [
  'What would he build differently at Razorpay if he could go back?',
  'What does the right next role look like to him — not in title, but in what he gets to own?',
];

function AdvisoryScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 2800),
      setTimeout(() => setStep(3), 4200),
      setTimeout(() => setStep(4), 5800),
    ];
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const quickTake = useTypewriter(QUICK_TAKE, 20, step >= 1, 0);

  return (
    <Scene>
      <Label>A point of view · Arjun Mehta</Label>
      <h2 className="text-3xl font-extrabold font-display text-white tracking-tight mb-5">
        Why this person.
      </h2>

      <Card className="overflow-hidden">

        {/* Quick take */}
        <div className="p-5 border-b border-white/[0.06]">
          <Label>Point of view</Label>
          <p className="text-base text-white/90 font-light leading-relaxed italic">
            "{step >= 1 ? quickTake : ''}
            {step >= 1 && quickTake.length < QUICK_TAKE.length && (
              <span className="animate-pulse text-axel-400 not-italic">▍</span>
            )}"
          </p>
        </div>

        {/* Where they add value */}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 border-b border-white/[0.06]"
          >
            <Label>What makes him different</Label>
            <ul className="space-y-2">
              {ADD_VALUE.map((v, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-2 text-sm text-white/70 font-light"
                >
                  <span className="text-white/20 mt-px shrink-0">·</span>
                  {v}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Open questions */}
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5"
          >
            <Label>Open questions</Label>
            <ol className="space-y-2">
              {OPEN_QS.map((q, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-start gap-2.5 text-sm text-white/60 font-light"
                >
                  <span className="font-mono text-[10px] text-white/25 shrink-0 pt-0.5">{i + 1}.</span>
                  {q}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        )}
      </Card>

      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 text-sm text-emerald-400 font-medium mt-4"
        >
          <CheckCircle2 className="w-4 h-4" />
          Point of view ready — acting with context
        </motion.div>
      )}
    </Scene>
  );
}

// ─── Scene 5: Outreach ────────────────────────────────────────────────────────
const OUTREACH_BODY =
  `Hi Arjun,

I read about the migration work at Razorpay. Owning a zero-downtime move at that scale is not something most engineers get to do — and the way you wrote about what broke is the kind of thinking we are looking for.

We are building payments infrastructure at Acme Corp from scratch. Series A, 45 people. You would be the person defining how it scales, not inheriting someone else's decisions.

If that sounds like the right problem, I would like to talk.`;

function OutreachScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 5200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const body = useTypewriter(OUTREACH_BODY, 14, step >= 1, 300);

  return (
    <Scene>
      <Label>Acting with context · Arjun Mehta</Label>
      <h2 className="text-3xl font-extrabold font-display text-white tracking-tight mb-5">
        Outreach that reflects real intent.
      </h2>

      <Card className="overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono text-white/25">FROM</span>
          <span className="text-xs text-white/60">Axel · on behalf of Acme Corp</span>
        </div>
        <div className="px-4 py-4 min-h-[160px]">
          <pre className="text-sm text-white/80 font-light leading-relaxed whitespace-pre-wrap font-sans">
            {body}
            {body.length < OUTREACH_BODY.length && step >= 1 && (
              <span className="animate-pulse text-axel-400">▍</span>
            )}
          </pre>
        </div>
      </Card>

      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-axel-500 text-white text-sm font-semibold">
              <Check className="w-4 h-4" />
              Outreach sent
            </div>
            <span className="text-xs text-white/40">to 5 matched candidates</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Scene>
  );
}

// ─── Scene 6: Pipeline ────────────────────────────────────────────────────────
const REPLY_TEXT = '"Interesting. What does the next 18 months look like here?"';

function PipelineScene({ active, onReplay }: { active: boolean; onReplay: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const ts = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3200),
      setTimeout(() => setStep(4), 4400),
    ];
    return () => ts.forEach(clearTimeout);
  }, [active]);

  const reply = useTypewriter(REPLY_TEXT, 22, step >= 2, 300);

  return (
    <Scene>
      <Label>Learning begins</Label>
      <h2 className="text-3xl font-extrabold font-display text-white tracking-tight mb-5">
        The system is watching.
      </h2>

      <div className="space-y-3 mb-6">

        {/* Status row */}
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { n: '5', label: 'Outreach sent',       color: 'text-white/70'  },
              { n: '1', label: 'Response received',   color: 'text-emerald-400' },
              { n: '4', label: 'Awaiting response',   color: 'text-amber-400'  },
            ].map(({ n, label, color }) => (
              <Card key={label} className="p-3 text-center">
                <p className={`text-2xl font-extrabold font-display ${color} mb-0.5`}>{n}</p>
                <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{label}</p>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Reply */}
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: 3 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
                <span className="text-xs font-semibold text-white/80">Arjun Mehta</span>
                <span className="text-[10px] text-white/30 ml-auto">2 min ago</span>
              </div>
              <p className="text-sm text-white/70 italic font-light leading-relaxed">
                {reply}
                {reply.length < REPLY_TEXT.length && (
                  <span className="animate-pulse text-axel-400">▍</span>
                )}
              </p>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Final CTA */}
      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          className="border-t border-white/[0.08] pt-6"
        >
          <p className="text-2xl font-extrabold font-display text-white tracking-tight mb-2">
            Build a pipeline that thinks.
          </p>
          <p className="text-sm text-white/40 font-light mb-5">
            This was a simulation. The real one learns from every decision you make.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/access"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors shadow-[0_4px_20px_rgba(84,70,229,0.4)]"
            >
              Get early access <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onReplay}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.12] text-white/50 text-sm hover:text-white/80 hover:border-white/25 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay
            </button>
          </div>
        </motion.div>
      )}
    </Scene>
  );
}

// ─── Input gate (pre-simulation) ─────────────────────────────────────────────
function InputGate({ onStart }: { onStart: (inputs: UserInputs) => void }) {
  const [role,     setRole]     = useState('');
  const [company,  setCompany]  = useState('');
  const [location, setLocation] = useState('');
  const [budget,   setBudget]   = useState('');

  const inputCls =
    'w-full bg-white/[0.05] border border-white/[0.10] rounded-lg px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-axel-500/60 focus:ring-1 focus:ring-axel-500/30 transition-colors font-light';

  const handleRun = () => {
    onStart({
      role:     role.trim()     || DEFAULT_INPUTS.role,
      company:  company.trim()  || DEFAULT_INPUTS.company,
      location: location.trim() || DEFAULT_INPUTS.location,
      budget:   budget.trim()   || DEFAULT_INPUTS.budget,
    });
  };

  return (
    <Scene>
      <div className="mb-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-axel-400 mb-2">
          Tell Axel what you are trying to build
        </p>
        <h2 className="text-3xl font-extrabold font-display text-white tracking-tight leading-tight mb-1">
          Describe the context.
        </h2>
        <p className="text-sm text-white/35 font-light">
          Not a job description. The actual problem you are trying to solve.
        </p>
      </div>

      <Card className="p-5 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] font-mono text-white/25 uppercase tracking-wider block mb-1.5">
              What you are building
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Payments infrastructure from scratch"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-mono text-white/25 uppercase tracking-wider block mb-1.5">
              Who you are
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Acme Corp · Series A · 45 people"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-mono text-white/25 uppercase tracking-wider block mb-1.5">
              Where
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Bangalore, India"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-mono text-white/25 uppercase tracking-wider block mb-1.5">
              Compensation
            </label>
            <input
              className={inputCls}
              placeholder="e.g. ₹30–40 LPA"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleRun}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors shadow-[0_4px_20px_rgba(84,70,229,0.35)]"
        >
          Run Axel <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onStart(DEFAULT_INPUTS)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.12] text-white/50 text-sm hover:text-white/80 hover:border-white/25 transition-colors"
        >
          Watch an example
        </button>
      </div>
    </Scene>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({ phase, done }: { phase: number; done: boolean }) {
  return (
    <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-axel-500 rounded-lg flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" fill="white" />
        </div>
        <span className="font-extrabold font-display text-white text-base tracking-tight">Axel</span>
        <span className="text-[10px] font-mono text-white/25 ml-2 tracking-widest uppercase">
          Hiring OS
        </span>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1.5">
        {PHASES.map((p, i) => {
          const isDone = i < phase || done;
          const isActive = i === phase && !done;
          return (
            <div
              key={p.id}
              className={`rounded-full transition-all duration-500 ${
                isDone   ? 'w-4 h-1.5 bg-axel-500'               : ''
              }${isActive ? 'w-4 h-1.5 bg-white/80'              : ''
              }${!isDone && !isActive ? 'w-1.5 h-1.5 bg-white/15' : ''}`}
            />
          );
        })}
      </div>

      {/* CTA */}
      <Link
        to="/access"
        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/[0.12] text-white/60 text-xs font-medium hover:text-white hover:border-white/25 transition-colors"
      >
        Get access <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ─── Bottom status bar ────────────────────────────────────────────────────────
function StatusBar({ phase, done }: { phase: number; done: boolean }) {
  const current = done ? PHASES[6] : PHASES[phase];
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-5 py-2.5 border-t border-white/[0.05]">
      {!done ? (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-axel-500 shrink-0"
        />
      ) : (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      )}
      <span className="text-[11px] font-mono text-white/30">
        {current.status}
      </span>
      <span className="ml-auto text-[10px] font-mono text-white/15">
        {done ? 'Complete' : `Step ${phase + 1} of ${PHASES.length}`}
      </span>
    </div>
  );
}

// ─── Main simulation ──────────────────────────────────────────────────────────
interface AxelSimulationProps {
  /** When true the component fills its parent instead of taking the full viewport */
  embedded?: boolean;
}

export function AxelSimulation({ embedded }: AxelSimulationProps) {
  const [inputs, setInputs] = useState<UserInputs | null>(null); // null = show gate
  const [phase,  setPhase]  = useState(0);
  const [done,   setDone]   = useState(false);

  const advance = useCallback(() => {
    setPhase(p => {
      const next = p + 1;
      if (next >= PHASES.length) { setDone(true); return p; }
      return next;
    });
  }, []);

  // Auto-advance only once inputs are confirmed
  useEffect(() => {
    if (!inputs || done) return;
    const t = setTimeout(advance, PHASES[phase].ms);
    return () => clearTimeout(t);
  }, [phase, done, advance, inputs]);

  const replay = useCallback(() => {
    setInputs(null);
    setPhase(0);
    setDone(false);
  }, []);

  const rootCls = embedded
    ? 'w-full h-full bg-[#0D0C0B] flex flex-col overflow-hidden select-none'
    : 'h-screen w-screen bg-[#0D0C0B] flex flex-col overflow-hidden select-none';

  return (
    <div className={rootCls}>
      <TopBar phase={phase} done={done} />

      {/* Stage */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!inputs ? (
            <InputGate key="gate" onStart={inp => { setInputs(inp); setPhase(0); setDone(false); }} />
          ) : (
            <div key="sim" className="absolute inset-0">
              <AnimatePresence mode="wait">
                {phase === 0 && !done && <RoleInputScene key="0" active inputs={inputs} />}
                {phase === 1 && !done && <StrategyScene  key="1" active />}
                {phase === 2 && !done && <SourcingScene  key="2" active />}
                {phase === 3 && !done && <AnalysisScene  key="3" active />}
                {phase === 4 && !done && <AdvisoryScene  key="4" active />}
                {phase === 5 && !done && <OutreachScene  key="5" active />}
                {(phase === 6 || done) && <PipelineScene key="6" active onReplay={replay} />}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>

      {inputs && <StatusBar phase={phase} done={done} />}
    </div>
  );
}
