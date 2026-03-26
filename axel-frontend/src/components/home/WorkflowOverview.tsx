import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, BrainCircuit, Users } from 'lucide-react';

const STEPS = [
  {
    n:    '01',
    Icon: FileText,
    title: 'Describe the role',
    body:  'Tell Axel your company, the role, budget, location, and growth context. That\'s it.',
    hint:  '~2 minutes',
  },
  {
    n:    '02',
    Icon: BrainCircuit,
    title: 'Axel creates a plan',
    body:  'Axel writes a sourcing strategy, identifies target companies and titles, and prepares for outreach before sourcing a single candidate.',
    hint:  'Advisory-first',
  },
  {
    n:    '03',
    Icon: Users,
    title: 'You get the pipeline',
    body:  'Candidates are sourced, analyzed, and delivered as decision-ready briefings — organized by signal strength.',
    hint:  'Decision-ready',
  },
] as const;

const fadeUp = {
  initial:   { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true },
};

export function WorkflowOverview() {
  return (
    <section className="bg-white border-y border-stone-200/60">
      <div className="max-w-screen-xl mx-auto px-6 py-24 lg:py-32">

        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.p
            {...fadeUp}
            className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.08 }}
            className="text-4xl lg:text-5xl font-extrabold font-display leading-[1.08] tracking-tight text-axel-ink mb-4"
          >
            From role description
            <br />to shortlist — autonomously.
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.16 }}
            className="text-lg text-stone-500 font-light leading-relaxed"
          >
            Axel doesn't wait for instructions. Once you describe what you need,
            it plans, sources, analyzes, and briefs you — without hand-holding.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-14">
          {STEPS.map(({ n, Icon, title, body, hint }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 280, damping: 28 }}
              className="relative"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-5 left-[calc(100%+1px)] w-8 h-px bg-stone-200 z-10"
                />
              )}

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-axel-50 border border-axel-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-axel-500" />
                  </div>
                  <span className="font-display font-light text-4xl text-stone-100 leading-none select-none">{n}</span>
                </div>
                <div>
                  <h3 className="font-bold font-display text-axel-ink text-lg mb-2 tracking-tight">{title}</h3>
                  <p className="text-stone-500 font-light text-sm leading-relaxed mb-2">{body}</p>
                  <span className="text-xs text-stone-400 font-mono">{hint}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/workflow"
            className="inline-flex items-center gap-2 text-sm font-semibold text-axel-500 hover:text-axel-600 transition-colors"
          >
            See the full 8-step workflow <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
