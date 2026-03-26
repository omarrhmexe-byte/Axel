import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { WorkflowCanvas } from '../workflow/WorkflowCanvas';

// ─── Live pipeline status ticker ──────────────────────────────────────────────
const LIVE_RUNS = [
  'Senior Backend Engineer · Acme Corp · Sourcing candidates',
  'Product Lead · Horizon AI · Generating advisory',
  'Staff Engineer · Finaxis · Pipeline ready — 6 matched',
  'Head of Design · Luma Labs · Outreach sent to 9 candidates',
  'Backend Engineer · Crest · Analysis running',
] as const;

function LiveTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LIVE_RUNS.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-2.5 text-xs text-stone-500 overflow-hidden">
      <span className="flex items-center gap-1.5 shrink-0 text-stone-400 font-mono uppercase tracking-widest text-[10px]">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
        />
        Live
      </span>
      <span className="w-px h-3 bg-stone-200 shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="truncate text-stone-500"
        >
          {LIVE_RUNS[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Right-side product snapshot ─────────────────────────────────────────────
const LOG_LINES = [
  { delay: 0.6,  text: 'Role context parsed — Senior Backend Engineer, Series A, Bangalore' },
  { delay: 1.4,  text: 'Advisory created — target companies + talent pool reasoning' },
  { delay: 2.4,  text: 'Sourcing from GitHub (9) · Internal DB (23) · 32 total' },
  { delay: 3.4,  text: 'Candidate analysis complete — 5 matched across signal tiers' },
  { delay: 4.4,  text: 'Personalized outreach drafted for 5 candidates' },
] as const;

const BRIEF_CARD = {
  name:      'Arjun Mehta',
  tagline:   'The right engineer for scaling your payments infra.',
  badge:     'High Signal',
  badgeCls:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  accentCls: 'border-l-emerald-400',
  signals: [
    'Led zero-downtime migration at Razorpay — ₹100M+ daily volume',
    'On-call ownership, 5 postmortems authored',
    'Active open-source contributor — payment tooling',
  ],
} as const;

function ProductSnapshot() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCard,     setShowCard]     = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOG_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay * 1000));
    });

    timers.push(setTimeout(() => setShowCard(true), 5200));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-8 bg-gradient-to-br from-axel-100/30 via-transparent to-violet-50/20 rounded-3xl blur-3xl pointer-events-none"
      />

      <div className="relative bg-white rounded-2xl border border-stone-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-stone-50/80 border-b border-stone-100">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300/70" />
          <span className="ml-3 text-[10px] font-mono text-stone-400 tracking-widest">
            axel · pipeline · live
          </span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
          />
        </div>

        {/* Role header */}
        <div className="px-5 py-3 border-b border-stone-50 bg-stone-50/30">
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-0.5">Active run</p>
          <p className="text-sm font-semibold text-axel-ink">Senior Backend Engineer</p>
          <p className="text-xs text-stone-400">Acme Corp · Series A · Bangalore · ₹30–40 LPA</p>
        </div>

        {/* Log */}
        <div className="px-5 py-4 space-y-2.5 min-h-[120px] bg-white">
          {LOG_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-stone-600 leading-relaxed">{line.text}</p>
            </motion.div>
          ))}
          {visibleLines > 0 && visibleLines < LOG_LINES.length && (
            <div className="flex items-start gap-2.5">
              <Loader2 className="w-3.5 h-3.5 text-axel-500 animate-spin shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-stone-400 leading-relaxed">
                {LOG_LINES[visibleLines]?.text}
              </p>
            </div>
          )}
        </div>

        {/* Candidate brief card — appears after pipeline runs */}
        <AnimatePresence>
          {showCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className={`mx-4 mb-4 rounded-xl border border-stone-200/60 border-l-4 ${BRIEF_CARD.accentCls} bg-stone-50/60 p-4`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[13px] font-bold text-axel-ink">{BRIEF_CARD.name}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${BRIEF_CARD.badgeCls}`}>
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  {BRIEF_CARD.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 italic mb-2.5 leading-relaxed">
                "{BRIEF_CARD.tagline}"
              </p>
              <ul className="space-y-1">
                {BRIEF_CARD.signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-stone-600">
                    <span className="text-stone-300 mt-px shrink-0 font-mono">{String(i + 1).padStart(2, '0')}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function HomeHero() {
  return (
    <section className="relative bg-stone-50 overflow-hidden dot-grid">
      {/* Subtle top gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-white/60 to-transparent"
      />

      <div className="relative max-w-screen-xl mx-auto px-6 pt-20 pb-0 lg:pt-28">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* ── Left: copy ─────────────────────────────────────────── */}
          <div className="pb-20 lg:pb-32">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 mb-7"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-axel-100 bg-axel-50 text-xs font-semibold text-axel-500">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-axel-500 inline-block"
                />
                Introducing Axel
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.5, type: 'spring', stiffness: 260, damping: 28 }}
              className="font-extrabold font-display tracking-tight text-axel-ink leading-[1.04] mb-5"
              style={{ fontSize: 'clamp(3rem, 6vw, 4.75rem)' }}
            >
              Your Hiring OS.
              <br />
              <span className="text-axel-500">Recruitment</span>
              <br />
              on autopilot.
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 260, damping: 28 }}
              className="text-lg text-stone-500 font-light leading-relaxed mb-3 max-w-[460px]"
            >
              We connect the top&nbsp;5% of startups to the top&nbsp;5% of talent.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.19, type: 'spring', stiffness: 260, damping: 28 }}
              className="text-base text-stone-400 font-light leading-relaxed mb-9 max-w-[480px]"
            >
              Tell Axel who you want to hire. It builds the strategy, sources the people,
              and delivers a decision-ready pipeline — so you can focus on building.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, type: 'spring', stiffness: 260, damping: 28 }}
              className="flex items-center gap-3 flex-wrap mb-10"
            >
              <Link
                to="/access"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors shadow-[0_2px_12px_rgba(84,70,229,0.35)]"
              >
                Run a pipeline <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/workflow"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                See how it works
              </Link>
            </motion.div>

            {/* Live ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="max-w-[440px]"
            >
              <LiveTicker />
            </motion.div>
          </div>

          {/* ── Right: product snapshot ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.6, type: 'spring', stiffness: 180, damping: 28 }}
            className="hidden lg:block pb-12"
          >
            <ProductSnapshot />
          </motion.div>
        </div>
      </div>

      {/* Canvas section — full-width, flush to hero bottom */}
      <div className="bg-white border-t border-stone-200/60">
        <div className="max-w-screen-xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                Execution engine
              </p>
              <h2 className="text-2xl font-extrabold font-display text-axel-ink tracking-tight">
                Axel runs the full recruiting function.
              </h2>
            </div>
            <p className="text-sm text-stone-400 font-light max-w-xs">
              Eight orchestrated steps. Zero manual work.
              From role brief to decision-ready pipeline.
            </p>
          </div>
          <WorkflowCanvas demo />
        </div>
      </div>
    </section>
  );
}
