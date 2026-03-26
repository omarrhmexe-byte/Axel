/**
 * WorkflowDiagram — Rewritten as conceptual prose flow.
 * Not a diagram. Not numbered steps. Layers of understanding,
 * revealed line by line as you scroll.
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Line variants ─────────────────────────────────────────────────────────
type Variant = 'label' | 'main' | 'sub' | 'divider';

interface FlowLine {
  text: string;
  variant: Variant;
}

// ─── The conceptual flow ──────────────────────────────────────────────────
const LINES: FlowLine[] = [
  { text: 'How Axel works',                                variant: 'label'   },

  { text: 'It starts with what you are trying to build.',  variant: 'main'    },
  { text: 'Not just a role.',                              variant: 'sub'     },
  { text: 'Not just requirements.',                        variant: 'sub'     },

  { text: '',                                              variant: 'divider' },

  { text: 'Axel understands the context.',                 variant: 'main'    },
  { text: 'What matters.',                                 variant: 'sub'     },
  { text: 'What does not.',                                variant: 'sub'     },
  { text: 'What actually defines success.',                variant: 'sub'     },

  { text: '',                                              variant: 'divider' },

  { text: 'Candidates enter as profiles.',                 variant: 'main'    },
  { text: 'Not resumes.',                                  variant: 'sub'     },
  { text: 'Not keywords.',                                 variant: 'sub'     },

  { text: '',                                              variant: 'divider' },

  { text: 'Signals are extracted.',                        variant: 'main'    },
  { text: 'Not scores.',                                   variant: 'sub'     },
  { text: 'Not rankings.',                                 variant: 'sub'     },

  { text: '',                                              variant: 'divider' },

  { text: 'Axel forms a point of view.',                   variant: 'main'    },
  { text: 'Why this person.',                              variant: 'sub'     },
  { text: 'Why now.',                                      variant: 'sub'     },
  { text: 'Why this company.',                             variant: 'sub'     },

  { text: '',                                              variant: 'divider' },

  { text: 'You decide with clarity.',                      variant: 'main'    },
  { text: 'The system learns from every outcome.',         variant: 'main'    },
];

// ─── Single line ─────────────────────────────────────────────────────────
function FlowItem({ line, index }: { line: FlowLine; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  if (line.variant === 'divider') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="h-10"
      />
    );
  }

  const classMap: Record<Exclude<Variant, 'divider'>, string> = {
    label: 'text-[10px] font-mono text-white/25 tracking-[0.2em] uppercase mb-12',
    main:  'text-[1.65rem] lg:text-[2rem] font-light text-white leading-snug',
    sub:   'text-[1.35rem] lg:text-[1.6rem] font-light text-white/30 leading-snug pl-5',
  };

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, x: line.variant === 'sub' ? 0 : -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        delay: 0.04 * (index % 5),
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={classMap[line.variant as Exclude<Variant, 'divider'>]}
    >
      {line.text}
    </motion.p>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────
export function WorkflowDiagram() {
  return (
    <section className="bg-[#0D0C0B] py-28 lg:py-40 border-t border-white/[0.04]">
      <div className="max-w-screen-xl mx-auto px-8 lg:px-16">
        <div className="max-w-2xl space-y-3">
          {LINES.map((line, i) => (
            <FlowItem key={i} line={line} index={i} />
          ))}
        </div>

        {/* Scroll nudge */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 text-[10px] font-mono text-white/18 tracking-widest uppercase"
        >
          Scroll to watch it run →
        </motion.p>
      </div>
    </section>
  );
}
