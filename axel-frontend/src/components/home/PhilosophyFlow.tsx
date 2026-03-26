/**
 * PhilosophyFlow — Four editorial idea sections:
 * Core Idea · Candidate-First · Ambition · Company Filter
 * Lines reveal progressively as you scroll. No boxes. No icons.
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Prose line reveal ────────────────────────────────────────────────────────
function ProseLine({
  children,
  delay = 0,
  variant = 'main',
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: 'heading' | 'main' | 'sub' | 'bullet' | 'emphasis';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const styles: Record<string, string> = {
    heading:  'text-[11px] font-mono text-stone-400 tracking-[0.18em] uppercase mb-6',
    main:     'text-2xl lg:text-3xl font-light text-stone-800 leading-snug',
    sub:      'text-xl lg:text-2xl font-light text-stone-400 leading-snug ml-6',
    bullet:   'text-lg lg:text-xl font-light text-stone-500 leading-snug ml-8',
    emphasis: 'text-2xl lg:text-3xl font-semibold text-stone-900 leading-snug',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={styles[variant]}
    >
      {children}
    </motion.div>
  );
}

// ─── One idea block ───────────────────────────────────────────────────────────
function IdeaBlock({
  children,
  border = false,
}: {
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`py-24 lg:py-32 ${border ? 'border-t border-stone-100' : ''}`}>
      <div className="max-w-2xl space-y-3">{children}</div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export function PhilosophyFlow() {
  return (
    <section className="bg-white">
      <div className="max-w-screen-xl mx-auto px-8 lg:px-16">

        {/* ── Core Idea ─────────────────────────────────────────────────────── */}
        <IdeaBlock>
          <ProseLine variant="heading" delay={0}>Most hiring systems are company-first</ProseLine>
          <ProseLine variant="sub"      delay={0}>They optimize for filling roles.</ProseLine>
          <ProseLine variant="sub"      delay={0}>They rank people.</ProseLine>
          <ProseLine variant="sub"      delay={0}>They filter resumes.</ProseLine>
          <ProseLine variant="sub"      delay={0}>They move fast without context.</ProseLine>
          <div className="h-6" />
          <ProseLine variant="main"     delay={0}>Axel does the opposite.</ProseLine>
          <ProseLine variant="emphasis" delay={0}>We start with the candidate.</ProseLine>
        </IdeaBlock>

        {/* ── Candidate-first ───────────────────────────────────────────────── */}
        <IdeaBlock border>
          <ProseLine variant="heading"  delay={0}>Built for the candidate</ProseLine>
          <ProseLine variant="main"     delay={0}>Great engineers are not looking for jobs.</ProseLine>
          <ProseLine variant="sub"      delay={0}>They are looking for:</ProseLine>
          <ProseLine variant="bullet"   delay={0}>the right problem</ProseLine>
          <ProseLine variant="bullet"   delay={0}>the right team</ProseLine>
          <ProseLine variant="bullet"   delay={0}>the right moment</ProseLine>
          <div className="h-4" />
          <ProseLine variant="main"     delay={0}>Axel helps match them to that.</ProseLine>
        </IdeaBlock>

        {/* ── Ambition ──────────────────────────────────────────────────────── */}
        <IdeaBlock border>
          <ProseLine variant="heading"  delay={0}>We match ambition to ambition</ProseLine>
          <ProseLine variant="main"     delay={0}>Experience shows what someone has done.</ProseLine>
          <ProseLine variant="emphasis" delay={0}>Ambition shows what they are trying to become.</ProseLine>
          <div className="h-4" />
          <ProseLine variant="sub"      delay={0}>Most systems ignore that.</ProseLine>
          <ProseLine variant="main"     delay={0}>We do not.</ProseLine>
          <div className="h-4" />
          <ProseLine variant="sub"      delay={0}>
            We work with companies that can change careers —
          </ProseLine>
          <ProseLine variant="sub"      delay={0}>not just fill roles.</ProseLine>
        </IdeaBlock>

        {/* ── Company filter ────────────────────────────────────────────────── */}
        <IdeaBlock border>
          <ProseLine variant="heading"  delay={0}>We are selective</ProseLine>
          <ProseLine variant="main"     delay={0}>We do not work with every company.</ProseLine>
          <div className="h-4" />
          <ProseLine variant="sub"      delay={0}>Only teams that:</ProseLine>
          <ProseLine variant="bullet"   delay={0}>are building something meaningful</ProseLine>
          <ProseLine variant="bullet"   delay={0}>are scaling fast</ProseLine>
          <ProseLine variant="bullet"   delay={0}>can level up the people who join them</ProseLine>
          <div className="h-6" />
          <ProseLine variant="emphasis" delay={0}>
            Because great talent deserves better than average opportunities.
          </ProseLine>
        </IdeaBlock>

      </div>
    </section>
  );
}
