import { motion } from 'framer-motion';
import { ArrowRight, Github, Database, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

// ─── Mock pipeline data ───────────────────────────────────────────────────────
const MOCK_CANDIDATES = [
  {
    name:            'Arjun Mehta',
    title:           'Senior Backend Engineer',
    company:         'Razorpay → Smallcase',
    confidence:      'high'  as const,
    confidenceLabel: 'High Signal',
    badgeCls:        'badge-high',
    accentCls:       'card-accent-high',
    dotCls:          'bg-emerald-500',
    source:          'GitHub · Active Open Source',
    SourceIcon:      Github,
    signals: [
      '6 yrs TypeScript + Node.js at scale',
      'Built payment infra handling 10M+ txns/mo',
    ],
  },
  {
    name:            'Priya V.',
    title:           'Full Stack Lead',
    company:         'Cred → Groww',
    confidence:      'medium' as const,
    confidenceLabel: 'Good Signal',
    badgeCls:        'badge-medium',
    accentCls:       'card-accent-medium',
    dotCls:          'bg-amber-500',
    source:          'Internal DB · Referred',
    SourceIcon:      Database,
    signals: [
      'Product-minded, led 4-person eng team',
      'React + Python at Series A startup',
    ],
  },
  {
    name:            'Karan Shah',
    title:           'Systems Engineer',
    company:         'Microsoft India',
    confidence:      'low'  as const,
    confidenceLabel: 'Worth Exploring',
    badgeCls:        'badge-low',
    accentCls:       'card-accent-low',
    dotCls:          'bg-violet-500',
    source:          'GitHub · Personal Projects',
    SourceIcon:      Github,
    signals: [
      'Distributed systems background in Go + Rust',
      'Active side projects — relocating to Bangalore',
    ],
  },
] as const;

// ─── Mini card shown in the hero preview ─────────────────────────────────────
function MockCard({
  c,
  delay,
}: {
  c: (typeof MOCK_CANDIDATES)[number];
  delay: number;
}) {
  const Icon = c.SourceIcon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 28 }}
      className={`bg-white rounded-xl border border-stone-200/80 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow ${c.accentCls}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-stone-900 text-sm font-display truncate">{c.name}</p>
          <p className="text-xs text-stone-500 truncate">{c.title} · {c.company}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.badgeCls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.dotCls}`} />
          {c.confidenceLabel}
        </span>
      </div>

      {/* Signals */}
      <div className="space-y-1 mb-2">
        {c.signals.map((s) => (
          <p key={s} className="text-xs text-stone-600 flex items-start gap-1.5">
            <span className="text-stone-300 mt-px shrink-0">·</span>
            {s}
          </p>
        ))}
      </div>

      {/* Source */}
      <div className="pt-2 border-t border-stone-100 flex items-center gap-1 text-xs text-stone-400">
        <Icon className="w-3 h-3 shrink-0" />
        {c.source}
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden bg-stone-50 dot-grid">

      {/* Subtle radial glow behind headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-100/40 blur-3xl"
      />

      <div className="relative max-w-screen-xl mx-auto px-6 py-24 w-full grid lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: copy ─────────────────────────────────────────────── */}
        <div>
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Now in early access
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.08, duration: 0.4, type: 'spring', stiffness: 280, damping: 28 }}
            className="text-5xl lg:text-[3.6rem] font-extrabold font-display leading-[1.08] tracking-tight text-stone-900 mb-5"
          >
            Hiring is broken.
            <br />
            Axel fixes it —{' '}
            <span className="text-gradient">automatically.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.16, duration: 0.4, type: 'spring', stiffness: 280, damping: 28 }}
            className="text-lg text-stone-500 font-light leading-relaxed mb-8 max-w-lg"
          >
            Tell Axel who you need. It sources, analyzes, and briefs you — no recruiter required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.24, duration: 0.4, type: 'spring', stiffness: 280, damping: 28 }}
            className="flex items-center gap-3 flex-wrap mb-10"
          >
            <Button size="lg" onClick={() => scrollTo('waitlist')}>
              Get early access <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => scrollTo('how')}>
              See how it works
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-stone-400"
          >
            Used by teams building their first 10 engineers.
          </motion.p>
        </div>

        {/* ── Right: live mock pipeline ───────────────────────────────── */}
        <div className="hidden lg:block relative">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-4 bg-gradient-to-br from-indigo-100/50 to-violet-100/30 rounded-3xl blur-2xl"
          />

          <div className="relative bg-white/90 backdrop-blur-sm border border-stone-200 rounded-2xl p-5 shadow-xl">

            {/* Pipeline header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" fill="white" />
                  </div>
                  <p className="text-sm font-bold text-stone-900 font-display">
                    Senior Backend Engineer
                  </p>
                </div>
                <p className="text-xs text-stone-500 pl-7">
                  Acme Corp · Bangalore · ₹30–40 LPA
                </p>
              </div>
              <Spinner label="running" />
            </motion.div>

            {/* Candidate cards */}
            <div className="space-y-2.5">
              {MOCK_CANDIDATES.map((c, i) => (
                <MockCard key={c.name} c={c} delay={0.8 + i * 0.4} />
              ))}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4 }}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between"
            >
              <p className="text-xs text-stone-400">
                14 sourced · 3 matched · briefing ready
              </p>
              <div className="flex gap-1">
                {['bg-emerald-400', 'bg-amber-400', 'bg-violet-400'].map((cls, i) => (
                  <span
                    key={cls}
                    className={`w-2 h-2 rounded-full ${cls} animate-pulse`}
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
