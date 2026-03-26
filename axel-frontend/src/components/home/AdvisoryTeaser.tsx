import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { delay, type: 'spring' as const, stiffness: 280, damping: 28 },
});

function MockAdvisory() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">Hiring Advisory</p>
        <p className="text-sm font-semibold text-stone-900">Senior Backend Engineer · Acme Corp</p>
      </div>

      <div className="px-6 py-5 space-y-5">

        {/* Strategy */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">Sourcing Strategy</p>
          <p className="text-sm text-stone-700 leading-relaxed">
            Focus on engineers with 4–8 years at B2B SaaS or fintech companies
            in Bangalore. Avoid Big Tech senior bands. Prioritize candidates who
            have owned systems end-to-end at startup scale.
          </p>
        </div>

        {/* Target companies */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">Target Companies</p>
          <div className="flex flex-wrap gap-2">
            {['Razorpay', 'Chargebee', 'Hasura', 'Postman', 'Nilenso'].map((c) => (
              <span key={c} className="px-2.5 py-1 bg-axel-50 text-axel-500 text-xs font-medium rounded-lg border border-axel-100">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Talent pool */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">Talent Pool Reasoning</p>
          <p className="text-sm text-stone-600 leading-relaxed">
            At ₹35 LPA, you're competitive against mid-stage startups — not Big Tech.
            This is your advantage: engineers who've outgrown corporate structure but
            aren't ready to start their own company.
          </p>
        </div>

        {/* Open questions */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">Interview Signals</p>
          <ul className="space-y-1.5">
            {[
              'Led a migration or architecture decision end-to-end',
              'Comfortable with on-call and postmortems',
              'Active open-source presence in backend tooling',
            ].map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                <span className="text-stone-300 mt-0.5 shrink-0">·</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AdvisoryTeaser() {
  return (
    <section className="bg-stone-50">
      <div className="max-w-screen-xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: mock advisory */}
          <motion.div {...fadeUp(0.1)}>
            <MockAdvisory />
          </motion.div>

          {/* Right: copy */}
          <div>
            <motion.p {...fadeUp(0)} className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
              Advisory-first
            </motion.p>
            <motion.h2
              {...fadeUp(0.08)}
              className="text-4xl lg:text-5xl font-extrabold font-display leading-[1.08] tracking-tight text-axel-ink mb-5"
            >
              Axel thinks
              <br />before it sources.
            </motion.h2>
            <motion.p {...fadeUp(0.16)} className="text-lg text-stone-500 font-light leading-relaxed mb-6">
              Before sourcing a single candidate, Axel creates a complete hiring strategy —
              target companies, ideal titles, talent pool reasoning, and interview signals.
            </motion.p>
            <motion.p {...fadeUp(0.22)} className="text-base text-stone-600 leading-relaxed mb-8">
              You review the plan and approve it. Then Axel sources. This means every
              candidate in your pipeline was found with purpose — not broad spray.
            </motion.p>
            <motion.div {...fadeUp(0.28)}>
              <Link
                to="/advisory"
                className="inline-flex items-center gap-2 text-sm font-semibold text-axel-500 hover:text-axel-600 transition-colors"
              >
                See the advisory demo <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
