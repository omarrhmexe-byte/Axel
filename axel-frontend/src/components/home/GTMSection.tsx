import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, LayoutGrid } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { delay, type: 'spring' as const, stiffness: 220, damping: 28 },
});

const PILLARS = [
  {
    Icon:    Target,
    label:   'Strategy first',
    body:    'Every pipeline starts with a hiring brief: target companies, talent pool reasoning, constraints analysis. Axel thinks before it sources.',
    detail:  'Advisory · Target map · Comp analysis',
  },
  {
    Icon:    Zap,
    label:   'Full-stack execution',
    body:    'Sourcing, analysis, and personalized outreach — all in parallel. Axel doesn\'t wait for your bandwidth.',
    detail:  'GitHub · Internal DB · LinkedIn · Outreach',
  },
  {
    Icon:    LayoutGrid,
    label:   'Decision-ready output',
    body:    'Every candidate is a briefing: signals, trajectory, alignment analysis, and the three questions worth asking. Not a résumé. A brief.',
    detail:  'Advisory · Signals · Pipeline',
  },
] as const;

export function GTMSection() {
  return (
    <section className="bg-stone-50 border-y border-stone-200/60">
      <div className="max-w-screen-xl mx-auto px-6 py-24 lg:py-32">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 items-end">
          <div>
            <motion.p {...fadeUp(0)} className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-4">
              Recruiting as a function
            </motion.p>
            <motion.h2
              {...fadeUp(0.06)}
              className="font-extrabold font-display tracking-tight text-axel-ink leading-[1.06]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
            >
              Recruiting isn't HR.
              <br />
              It's GTM.
            </motion.h2>
          </div>

          <motion.div {...fadeUp(0.1)} className="space-y-3">
            <p className="text-lg text-stone-500 font-light leading-relaxed">
              The best companies treat the first&nbsp;50 engineers the same way they treat
              the first&nbsp;50 customers — with strategy, targeted outreach, and a pipeline.
            </p>
            <p className="text-base text-stone-400 font-light leading-relaxed">
              Axel is the recruiting infrastructure that treats hiring as growth, not administration.
              It runs the function so you can run the company.
            </p>
          </motion.div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {PILLARS.map(({ Icon, label, body, detail }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 240, damping: 28 }}
              className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <div className="w-10 h-10 rounded-xl bg-axel-50 border border-axel-100 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-axel-500" />
              </div>
              <h3 className="font-bold font-display text-axel-ink text-base mb-2 tracking-tight">
                {label}
              </h3>
              <p className="text-sm text-stone-500 font-light leading-relaxed mb-4">{body}</p>
              <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">{detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Link */}
        <motion.div {...fadeUp(0.08)}>
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
