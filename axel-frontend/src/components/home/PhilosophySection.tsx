import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { delay, type: 'spring' as const, stiffness: 220, damping: 28 },
});

const ASKS = [
  {
    n:    '01',
    q:    'Why would a top engineer leave their current company for yours?',
    hint: 'Mission, ownership, trajectory — not just the role.',
  },
  {
    n:    '02',
    q:    'What does your team look like in 18 months?',
    hint: 'Growth context shapes who we look for.',
  },
  {
    n:    '03',
    q:    'What problem are you solving — and why does it matter now?',
    hint: 'Timing is as important as ambition.',
  },
] as const;

const FINDS = [
  {
    n:    '01',
    q:    'Engineers who\'ve built at the right scale for your stage',
    hint: 'Not overqualified. Not under-experienced. Exactly right.',
  },
  {
    n:    '02',
    q:    'People ambitious in the direction you\'re heading',
    hint: 'Same problem space. Same growth appetite.',
  },
  {
    n:    '03',
    q:    'Candidates at the right career moment to make this leap',
    hint: 'Ready for more ownership. Ready for the challenge.',
  },
] as const;

function Item({ n, q, hint }: { n: string; q: string; hint: string }) {
  return (
    <div className="flex gap-4 py-4 border-b border-stone-800/40 last:border-0">
      <span className="font-mono text-xs text-stone-600 shrink-0 pt-0.5">{n}</span>
      <div>
        <p className="text-base text-stone-300 leading-snug mb-1">{q}</p>
        <p className="text-xs text-stone-600 leading-relaxed">{hint}</p>
      </div>
    </div>
  );
}

export function PhilosophySection() {
  return (
    <section className="bg-[#1C1917]">
      <div className="max-w-screen-xl mx-auto px-6 py-28 lg:py-36">

        {/* Top: Statement */}
        <div className="max-w-3xl mb-20">
          <motion.p
            {...fadeUp(0)}
            className="text-[10px] font-mono uppercase tracking-widest text-stone-600 mb-7"
          >
            Our thesis
          </motion.p>

          <motion.h2
            {...fadeUp(0.06)}
            className="font-extrabold font-display tracking-tight text-white leading-[1.04] mb-8"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
          >
            Match ambition
            <br />
            with ambition.
          </motion.h2>

          <motion.div {...fadeUp(0.12)} className="space-y-3 max-w-xl">
            <p className="text-xl text-stone-400 font-light leading-relaxed">
              We connect the top&nbsp;5% of startups to the top&nbsp;5% of talent.
            </p>
            <p className="text-base text-stone-500 font-light leading-relaxed">
              The best engineers aren't looking for jobs. They're looking for the right company
              at the right moment — one ambitious enough to be worth joining.
            </p>
            <p className="text-base text-stone-500 font-light leading-relaxed">
              Axel doesn't spray CVs. It builds a case: for your company, for this role,
              for why an exceptional engineer should make this move <em>now</em>.
            </p>
          </motion.div>
        </div>

        {/* Two-column: asks / finds */}
        <motion.div
          {...fadeUp(0.06)}
          className="grid md:grid-cols-2 gap-8 lg:gap-16 mb-14"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-axel-400 mb-4">
              What we ask companies
            </p>
            {ASKS.map(item => <Item key={item.n} {...item} />)}
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-600 mb-4">
              What we find for you
            </p>
            {FINDS.map(item => <Item key={item.n} {...item} />)}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.12)}>
          <Link
            to="/access"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white transition-colors"
          >
            Tell us why your company is worth joining
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
