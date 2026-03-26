import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HomeCTA() {
  return (
    <section className="bg-stone-50 border-t border-stone-200/60">
      <div className="max-w-screen-xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Workflow CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-4">Product</p>
            <h3 className="text-2xl font-extrabold font-display text-axel-ink tracking-tight mb-3">
              See the full workflow.
            </h3>
            <p className="text-stone-500 font-light leading-relaxed mb-6 text-sm">
              Walk through all 8 steps — from role description to interview scheduling.
              Understand exactly how Axel runs recruiting end to end.
            </p>
            <Link
              to="/workflow"
              className="inline-flex items-center gap-2 text-sm font-semibold text-axel-500 hover:text-axel-600 transition-colors"
            >
              Explore the workflow <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Access CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-axel-500 rounded-2xl p-8 shadow-[0_4px_20px_rgba(84,70,229,0.3)]"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-axel-100/60 mb-4">Early access</p>
            <h3 className="text-2xl font-extrabold font-display text-white tracking-tight mb-3">
              Run your next hire on Axel.
            </h3>
            <p className="text-axel-100/80 font-light leading-relaxed mb-6 text-sm">
              We're onboarding a select number of high-growth teams. Apply to be among
              the first to run a fully autonomous recruiting pipeline.
            </p>
            <Link
              to="/access"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-axel-500 text-sm font-semibold hover:bg-axel-50 transition-colors"
            >
              Apply for access <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
