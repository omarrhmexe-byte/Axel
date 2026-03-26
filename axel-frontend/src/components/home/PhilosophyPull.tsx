import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PhilosophyPull() {
  return (
    <section className="bg-[#1C1917]">
      <div className="max-w-screen-xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-3xl">

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-stone-600 mb-8"
          >
            Our belief
          </motion.p>

          <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 28 }}
            className="text-3xl lg:text-5xl font-extrabold font-display leading-[1.1] tracking-tight text-white mb-8"
          >
            "The best hire is a mutual decision — not a resume match."
          </motion.blockquote>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="text-lg text-stone-400 font-light leading-relaxed mb-10 max-w-xl"
          >
            Axel is built around a simple thesis: the best engineers join the right company
            at the right moment. Our job is to make that match possible at scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24 }}
          >
            <Link
              to="/philosophy"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white transition-colors"
            >
              Read our philosophy <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
