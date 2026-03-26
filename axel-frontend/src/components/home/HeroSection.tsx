/**
 * HeroSection — Dark, full-height opening statement.
 * Copy: "We match ambitious builders with ambitious companies."
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// ─── Line reveal animation ────────────────────────────────────────────────────
function Line({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="bg-[#0D0C0B] min-h-[92vh] flex items-center relative overflow-hidden">

      {/* Very subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative w-full max-w-screen-xl mx-auto px-8 lg:px-16 py-28 lg:py-36">

        {/* Eyebrow */}
        <Line delay={0.05} className="mb-10">
          <span className="text-[11px] font-mono text-white/25 tracking-[0.22em] uppercase">
            Axel
          </span>
        </Line>

        {/* Headline — breaks intentionally */}
        <div className="mb-10 max-w-4xl">
          <Line delay={0.18}>
            <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-bold text-white leading-[1.08] tracking-tight">
              We match ambitious builders
            </h1>
          </Line>
          <Line delay={0.3}>
            <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-bold text-white/50 leading-[1.08] tracking-tight">
              with ambitious companies.
            </h1>
          </Line>
        </div>

        {/* Subline */}
        <Line delay={0.5} className="max-w-md mb-5">
          <p className="text-[1.05rem] text-white/45 font-light leading-relaxed">
            Axel helps you understand where someone should go —
            <br />
            not just whether they can do the job.
          </p>
        </Line>

        {/* Secondary statement — the point of view */}
        <Line delay={0.68} className="mb-14">
          <p className="text-sm text-white/22 font-light tracking-wide">
            Hiring is not a filtering problem.{' '}
            <span className="text-white/38">It is a context problem.</span>
          </p>
        </Line>

        {/* CTAs */}
        <Line delay={0.85}>
          <div className="flex items-center gap-5">
            <Link
              to="/access"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0D0C0B] text-sm font-semibold rounded-lg hover:bg-white/88 transition-colors"
            >
              Start a role
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById('simulation')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              Watch Axel run →
            </button>
          </div>
        </Line>

      </div>
    </section>
  );
}
