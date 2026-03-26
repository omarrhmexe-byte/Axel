import { motion } from 'framer-motion';
import { Github, Database, ArrowUpRight } from 'lucide-react';

// ─── Mock intelligence briefs ─────────────────────────────────────────────────
const BRIEFS = [
  {
    name:      'Arjun Mehta',
    title:     'Senior Backend Engineer · Razorpay · 6 yrs',
    source:    'github' as const,
    confidence:'High Signal',
    accentCls: 'border-l-emerald-400',
    badgeCls:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotCls:    'bg-emerald-500',
    positioning:
      'The right engineer for scaling payments infrastructure at a Series A company with distributed systems ambitions.',
    whyNow:
      '3 years at Razorpay. Has shipped production systems at scale. Ready for end-to-end ownership. Not looking to go to Big Tech.',
    signals: [
      { n: '01', text: 'Led zero-downtime payment infra migration — ₹100M+ daily volume' },
      { n: '02', text: 'On-call rotation ownership — 5 postmortems authored' },
      { n: '03', text: 'Active OSS contributor to payment tooling (3.2k GitHub stars)' },
    ],
    openQs: [
      'How does he think about technical debt at startup scale?',
      'What made him stay at Razorpay for 3 years — and what makes him leave?',
    ],
    risk: null,
  },
  {
    name:      'Priya Venkataraman',
    title:     'Full Stack Lead · Cred · 5 yrs',
    source:    'db' as const,
    confidence:'Good Signal',
    accentCls: 'border-l-amber-400',
    badgeCls:  'bg-amber-50 text-amber-700 border-amber-200',
    dotCls:    'bg-amber-500',
    positioning:
      'A rare combination of product instinct and backend depth. Has led small teams through 0→1 product builds.',
    whyNow:
      'Led 4-person team that shipped Cred\'s rewards infra. Now wants broader ownership. Actively looking — timing is ideal.',
    signals: [
      { n: '01', text: 'Led 4-engineer team from architecture to production in 14 weeks' },
      { n: '02', text: 'TypeScript + Node.js with product-level ownership across full stack' },
      { n: '03', text: 'Built internal tooling adopted by 80% of Cred engineering' },
    ],
    openQs: [
      'How does she approach trade-offs between product speed and engineering quality?',
      'What kind of team does she want to build in the next 12 months?',
    ],
    risk: 'May expect a team lead title — worth clarifying scope upfront.',
  },
  {
    name:      'Karan Shah',
    title:     'Systems Engineer · Microsoft · 7 yrs',
    source:    'github' as const,
    confidence:'Worth Exploring',
    accentCls: 'border-l-violet-400',
    badgeCls:  'bg-violet-50 text-violet-700 border-violet-200',
    dotCls:    'bg-violet-500',
    positioning:
      'Strong distributed systems depth in Go + Rust. Relocating to Bangalore. Background is Big Tech — needs calibration on startup pace.',
    whyNow:
      'Actively exploring post-Microsoft moves. Strong OSS contributor. Relocation timeline uncertain — needs a call to gauge urgency.',
    signals: [
      { n: '01', text: 'Distributed systems and infra in Go + Rust — 4 open-source repos' },
      { n: '02', text: 'Contributed to Azure Service Fabric internals (large-scale distributed)' },
      { n: '03', text: '12k GitHub followers, active technical writing on systems design' },
    ],
    openQs: [
      'Is he comfortable with the ambiguity and pace of an early-stage startup?',
      'What\'s his relocation timeline — and what\'s driving the move?',
    ],
    risk: 'Big Tech pace mismatch — probe comfort with startup constraints.',
  },
] as const;

// ─── Intelligence brief card ──────────────────────────────────────────────────
function BriefCard({ brief, index }: { brief: typeof BRIEFS[number]; index: number }) {
  const Icon = brief.source === 'github' ? Github : Database;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 240, damping: 28 }}
      className={`
        group bg-white rounded-2xl border border-stone-200/60 border-l-4 ${brief.accentCls}
        shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)] transition-shadow duration-300
      `}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-extrabold font-display text-axel-ink text-[15px] tracking-tight leading-snug">
              {brief.name}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 leading-snug">{brief.title}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Icon className="w-3.5 h-3.5 text-stone-300" />
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${brief.badgeCls}`}>
              <span className={`w-1 h-1 rounded-full ${brief.dotCls}`} />
              {brief.confidence}
            </span>
          </div>
        </div>

        {/* Positioning line — the brief's core thesis */}
        <p className="text-[13px] text-stone-600 italic leading-snug">
          "{brief.positioning}"
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Why now */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1.5">
            Why now
          </p>
          <p className="text-[12px] text-stone-600 leading-relaxed">{brief.whyNow}</p>
        </div>

        {/* Signals */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1.5">
            Signals
          </p>
          <ul className="space-y-1.5">
            {brief.signals.map((s) => (
              <li key={s.n} className="flex items-start gap-2 text-[12px] text-stone-700">
                <span className="font-mono text-stone-300 shrink-0">{s.n}</span>
                {s.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Open questions */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1.5">
            Open questions
          </p>
          <ul className="space-y-1">
            {brief.openQs.map((q, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[12px] text-stone-500">
                <span className="text-stone-200 mt-px shrink-0">·</span>
                {q}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between">
        {brief.risk ? (
          <p className="text-[11px] text-amber-600 flex items-center gap-1.5">
            <span>△</span>
            <span className="line-clamp-1">{brief.risk}</span>
          </p>
        ) : (
          <span className="text-[11px] text-emerald-600 font-medium">No significant risks</span>
        )}
        <span className="text-[11px] text-stone-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open briefing <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function PipelinePreview() {
  return (
    <section className="bg-white border-y border-stone-200/60">
      <div className="max-w-screen-xl mx-auto px-6 py-24 lg:py-32">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3"
          >
            Pipeline output
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06, type: 'spring', stiffness: 240, damping: 28 }}
            className="text-4xl lg:text-5xl font-extrabold font-display leading-[1.07] tracking-tight text-axel-ink mb-4"
          >
            Not a résumé list.
            <br />A hiring brief.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="text-lg text-stone-500 font-light leading-relaxed"
          >
            Every candidate comes with a positioning thesis, signal analysis, timing context,
            and the three questions worth asking. The decision is yours — Axel gives you
            everything you need to make it well.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {BRIEFS.map((brief, i) => (
            <BriefCard key={brief.name} brief={brief} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
