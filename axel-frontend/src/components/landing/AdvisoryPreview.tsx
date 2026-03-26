import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

// Static mock data for the preview section
const MOCK_CARD = {
  name:            'Arjun Mehta',
  headline:        'Senior Backend Engineer · Razorpay → Smallcase',
  quickTake:       'A TypeScript specialist who has built payment infrastructure handling 10M+ transactions/month. Shows ownership signals — led a 3-person team through a critical migration with zero downtime.',
  matchReasons: [
    'Production-scale Node.js experience at high-throughput fintech',
    'Open-source contributor with active GitHub — 400+ contributions',
  ],
  risk:            'Currently at Razorpay with a competing offer pending — timeline could be tight.',
};

const MOCK_ADVISORY = {
  opening:         'Strong buy. Arjun has the exact profile you described — production TypeScript at fintech scale, startup comfort, and demonstrated ownership. The comp band aligns at ~32 LPA.',
  openQuestions: [
    'What draws you to a smaller team after Razorpay scale?',
    'Walk me through the zero-downtime migration you led.',
  ],
  redFlags:        'Competing offer is the main risk. Move to first call within 48 hours.',
  recommendation:  'Advance to technical screen. Prioritize over other candidates in this tier.',
};

export function AdvisoryPreview() {
  return (
    <section className="bg-white border-y border-stone-200">
      <div className="section">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold font-display tracking-tight text-stone-900 mb-3"
          >
            Every candidate arrives decision-ready.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-500 font-light max-w-xl mx-auto"
          >
            Not a résumé. A briefing. Built by the same intelligence that sourced them.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 28 }}
          className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* ── Candidate card ──────────────────────────────────────── */}
          <div className="card card-accent-high p-4 space-y-2.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold font-display text-stone-900 text-[15px] truncate">
                  {MOCK_CARD.name}
                </p>
                <p className="text-xs text-stone-500 leading-snug mt-0.5 line-clamp-2">
                  {MOCK_CARD.headline}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="badge-high inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  High Signal
                </span>
                <span className="badge-github inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border">
                  <Github className="w-2.5 h-2.5" />
                  GitHub
                </span>
              </div>
            </div>

            {/* Quick take */}
            <div className="bg-stone-50/60 rounded-lg p-2.5">
              <p className="text-xs text-stone-600 italic leading-relaxed">{MOCK_CARD.quickTake}</p>
            </div>

            {/* Match reasons */}
            <div className="space-y-1">
              {MOCK_CARD.matchReasons.map((r) => (
                <p key={r} className="text-xs text-stone-700 flex items-start gap-1.5">
                  <span className="text-stone-300 mt-px shrink-0">·</span>
                  {r}
                </p>
              ))}
            </div>

            {/* Risk flag */}
            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs text-stone-500 flex items-start gap-1.5">
                <span className="shrink-0 mt-px">△</span>
                {MOCK_CARD.risk}
              </p>
            </div>
          </div>

          {/* ── Advisory panel ──────────────────────────────────────── */}
          <div className="card p-4 space-y-3.5">
            <div className="pb-2.5 border-b border-stone-100">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Hiring Advisory</p>
            </div>

            {/* Opening */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Assessment</p>
              <p className="text-sm text-stone-700 leading-relaxed">{MOCK_ADVISORY.opening}</p>
            </div>

            {/* Open questions */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Open Questions</p>
              <div className="space-y-1.5">
                {MOCK_ADVISORY.openQuestions.map((q, i) => (
                  <p key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                    <span className="text-indigo-300 shrink-0 mt-px font-medium">{i + 1}.</span>
                    {q}
                  </p>
                ))}
              </div>
            </div>

            {/* Red flags */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Risk</p>
              <p className="text-xs text-stone-600 leading-relaxed">{MOCK_ADVISORY.redFlags}</p>
            </div>

            {/* Recommendation */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-0.5">Recommendation</p>
              <p className="text-xs text-emerald-800 leading-relaxed">{MOCK_ADVISORY.recommendation}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
