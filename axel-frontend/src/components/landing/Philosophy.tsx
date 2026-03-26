import { motion } from 'framer-motion';

const MANIFESTO = [
  {
    n:    '01',
    title: 'Signals, not scores.',
    body:  'We never reduce a person to a number. Axel extracts what matters — motivation, trajectory, working style — and presents it clearly.',
  },
  {
    n:    '02',
    title: 'Advisory before action.',
    body:  'Every candidate arrives with a hiring manager briefing. Context first, so your decisions are informed, not reactive.',
  },
  {
    n:    '03',
    title: 'The system does the work. You decide.',
    body:  'Axel handles sourcing, analysis, and enrichment autonomously. You stay in the loop for what matters: the final call.',
  },
] as const;

const STEPS = [
  {
    n:     '01',
    title: 'Describe the role',
    body:  'Tell Axel your company, role, budget, and constraints.',
    hint:  '(~2 min)',
  },
  {
    n:     '02',
    title: 'Axel goes sourcing',
    body:  'GitHub, internal DB, passive reach — all in parallel, autonomously.',
    hint:  '(GitHub + DB + passive)',
  },
  {
    n:     '03',
    title: 'Signals extracted',
    body:  'Candidate profiles are analyzed for fit, ownership signals, and trajectory.',
    hint:  '(TypeScript, Node.js, ownership)',
  },
  {
    n:     '04',
    title: 'Advisory delivered',
    body:  'Each candidate arrives with a briefing card ready for your hiring manager.',
    hint:  '(decision-ready)',
  },
] as const;

export function Philosophy() {
  return (
    <>
      {/* ── Manifesto ─────────────────────────────────────────────────── */}
      <section id="how" className="bg-white border-y border-stone-200">
        <div className="section">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-extrabold font-display leading-[1.08] tracking-tight text-stone-900 mb-4"
            >
              Most tools count résumés.
              <br />
              We read people.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-stone-500 font-light max-w-xl mx-auto"
            >
              Hiring decisions are consequential. Axel was built to give you the
              context you need to make them well — not just faster.
            </motion.p>
          </div>

          <div className="max-w-2xl mx-auto space-y-10">
            {MANIFESTO.map(({ n, title, body }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 280, damping: 28 }}
                className="flex gap-8 items-start"
              >
                <span className="font-display font-extrabold text-5xl text-indigo-100 leading-none shrink-0 select-none">
                  {n}
                </span>
                <div className="pt-1">
                  <h3 className="font-display font-extrabold text-xl text-stone-900 mb-1.5 tracking-tight">
                    {title}
                  </h3>
                  <p className="text-stone-500 font-light leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="bg-stone-50">
        <div className="section">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-extrabold font-display tracking-tight text-stone-900 mb-3"
            >
              From role description to shortlist — fully autonomous.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-stone-500 font-light"
            >
              Four steps. Zero manual sourcing.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line (desktop) */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-stone-200"
            />

            {STEPS.map(({ n, title, body, hint }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 280, damping: 28 }}
                className="relative flex flex-col"
              >
                {/* Big background number */}
                <span className="font-display font-light text-7xl text-stone-100 leading-none mb-2 select-none">
                  {n}
                </span>
                <h4 className="font-bold font-display text-stone-900 mb-1">{title}</h4>
                <p className="text-sm text-stone-500 font-light leading-relaxed mb-1">{body}</p>
                <p className="text-xs text-stone-400">{hint}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
