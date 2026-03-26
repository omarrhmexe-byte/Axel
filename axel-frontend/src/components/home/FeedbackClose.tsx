/**
 * FeedbackClose — The last three sections:
 * The system improves · What you actually get · Hiring should move careers forward
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// ─── Reveal line ──────────────────────────────────────────────────────────────
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export function FeedbackClose() {
  return (
    <section className="bg-white">
      <div className="max-w-screen-xl mx-auto px-8 lg:px-16">

        {/* ── Feedback loop ─────────────────────────────────────────────────── */}
        <div className="py-24 lg:py-32 max-w-2xl">
          <Reveal className="text-[10px] font-mono text-stone-400 tracking-[0.18em] uppercase mb-8">
            The system improves
          </Reveal>

          <Reveal className="text-2xl lg:text-3xl font-light text-stone-800 leading-snug mb-4">
            Every decision feeds back into Axel.
          </Reveal>

          <div className="space-y-1.5 mb-8 pl-4">
            {[
              'who was selected',
              'who declined',
              'what worked',
              'what did not',
            ].map((line, i) => (
              <Reveal key={line} delay={i * 0.04} className="text-xl font-light text-stone-400 leading-snug">
                {line}
              </Reveal>
            ))}
          </div>

          <Reveal className="text-2xl lg:text-3xl font-light text-stone-800 leading-snug mb-2">
            Over time, the system gets sharper.
          </Reveal>
          <Reveal className="text-xl font-light text-stone-400 leading-snug">
            Not by guessing.
          </Reveal>
          <Reveal className="text-xl font-light text-stone-600 leading-snug">
            But by learning from real outcomes.
          </Reveal>
        </div>

        {/* ── Product value ─────────────────────────────────────────────────── */}
        <div className="py-24 lg:py-32 border-t border-stone-100 max-w-2xl">
          <Reveal className="text-[10px] font-mono text-stone-400 tracking-[0.18em] uppercase mb-8">
            What you actually get
          </Reveal>

          <div className="space-y-5">
            {[
              'Candidates who should not be ignored.',
              'Clear reasoning behind every recommendation.',
              'Outreach that reflects real intent.',
              'A pipeline that stays coherent.',
            ].map((line, i) => (
              <Reveal
                key={line}
                delay={i * 0.06}
                className="text-2xl lg:text-3xl font-light text-stone-800 leading-snug"
              >
                {line}
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Final close ───────────────────────────────────────────────────── */}
        <div className="py-28 lg:py-40 border-t border-stone-100 max-w-2xl">
          <Reveal className="text-[10px] font-mono text-stone-400 tracking-[0.18em] uppercase mb-10">
            Hiring should move careers forward
          </Reveal>

          <div className="space-y-2 mb-12">
            <Reveal className="text-3xl lg:text-4xl font-light text-stone-400 leading-snug">
              Not just fill positions.
            </Reveal>
            <Reveal className="text-3xl lg:text-4xl font-light text-stone-400 leading-snug">
              Not just optimize funnels.
            </Reveal>
            <Reveal className="text-3xl lg:text-4xl font-semibold text-stone-900 leading-snug">
              But create real leverage.
            </Reveal>
          </div>

          <Reveal>
            <Link
              to="/access"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
            >
              Start with Axel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
