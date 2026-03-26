import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SiteNavbar } from '../components/site/SiteNavbar';
import { SiteFooter } from '../components/site/SiteFooter';

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { delay, type: 'spring' as const, stiffness: 200, damping: 28 },
});

function Divider() {
  return <div className="border-t border-stone-200/60 my-20 lg:my-28" />;
}

function Ordinal({ n }: { n: string }) {
  return (
    <span className="font-display font-light text-6xl text-stone-100 leading-none select-none mr-4">
      {n}
    </span>
  );
}

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SiteNavbar />
      <main className="flex-1">

        {/* Opening */}
        <section className="bg-white border-b border-stone-200/60">
          <div className="max-w-screen-lg mx-auto px-6 py-24 lg:py-36">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-8"
            >
              Our philosophy
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 28 }}
              className="text-5xl lg:text-7xl font-extrabold font-display leading-[1.05] tracking-tight text-axel-ink mb-8"
            >
              The best hire is
              <br />a mutual decision —
              <br />not a résumé match.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-xl text-stone-500 font-light leading-relaxed max-w-2xl"
            >
              We built Axel because we believe recruiting, done right, is one of the highest-leverage
              things a company can do — and one of the most consistently done wrong.
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-screen-lg mx-auto px-6 py-24">

          {/* 01: Candidate-first */}
          <motion.section {...fadeUp(0)} className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
            <Ordinal n="01" />
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-axel-ink tracking-tight mb-5">
                Every candidate deserves
                a considered response.
              </h2>
              <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg max-w-2xl">
                <p>
                  Most recruiting tools treat candidates as rows in a spreadsheet. They're sourced,
                  screened, scored, and ghosted — often within hours. The signal they provide about
                  your company is exactly what they experience in your process.
                </p>
                <p>
                  Axel is built candidate-first. Every person Axel reaches out to receives a
                  personalized message grounded in their actual background. Every person who responds
                  gets a considered reply. Every advance or rejection is logged — not because of
                  compliance, but because these are real people making real decisions about their careers.
                </p>
                <p>
                  We believe the quality of your hiring process signals the quality of your company.
                  The best engineers talk to each other. Reputation travels. Act accordingly.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* Pull quote 1 */}
          <motion.blockquote
            {...fadeUp(0.04)}
            className="border-l-4 border-axel-500 pl-8 py-2 my-4"
          >
            <p className="text-2xl lg:text-3xl font-display font-bold text-axel-ink leading-snug tracking-tight">
              "The quality of your hiring process signals the quality of your company."
            </p>
          </motion.blockquote>

          <Divider />

          {/* 02: Ambition x Ambition */}
          <motion.section {...fadeUp(0)} className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
            <Ordinal n="02" />
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-axel-ink tracking-tight mb-5">
                Match ambition with ambition —
                not credentials with requirements.
              </h2>
              <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg max-w-2xl">
                <p>
                  The companies that win the best engineers aren't the ones with the most
                  impressive brand or the highest comp band. They're the ones where the mission
                  matches the engineer's moment — where what the company is building aligns with
                  where the engineer wants to go.
                </p>
                <p>
                  This is why Axel doesn't work from job descriptions. It works from company
                  context — what you're building, why it matters, what the growth trajectory looks
                  like, and what kind of engineer will thrive here. Not "5 years of Node.js."
                  Instead: who is ambitious in the right direction right now?
                </p>
                <p>
                  A great hire happens when both sides say yes. Our job is to create the conditions
                  for that conversation — with the right people, with the right information, at the
                  right time.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* 03: Recruiting as a function */}
          <motion.section {...fadeUp(0)} className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
            <Ordinal n="03" />
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-axel-ink tracking-tight mb-5">
                High-growth teams need recruiting
                to scale as a function — not a task.
              </h2>
              <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg max-w-2xl">
                <p>
                  At the seed stage, recruiting is something the founder does between everything
                  else. At Series A, it becomes a growing distraction. By Series B, a broken
                  recruiting function is existential.
                </p>
                <p>
                  The problem is that recruiting requires expertise, tooling, and time — three
                  things early-stage teams have in short supply. Traditional agencies are slow and
                  expensive. Generic ATS platforms move the paperwork without moving the needle.
                  In-house recruiters are expensive to hire well.
                </p>
                <p>
                  Axel is a different model: an autonomous recruiting function that runs at the
                  quality of a great recruiter without the headcount. It understands your company,
                  knows how to position a role, and produces results that compound — each pipeline
                  run improves the system's understanding of what good looks like for you.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* Pull quote 2 */}
          <motion.blockquote
            {...fadeUp(0.04)}
            className="border-l-4 border-stone-300 pl-8 py-2 my-4"
          >
            <p className="text-2xl lg:text-3xl font-display font-bold text-axel-ink leading-snug tracking-tight">
              "Each pipeline run improves the system's understanding of what good looks like for you."
            </p>
          </motion.blockquote>

          <Divider />

          {/* 04: Signals not scores */}
          <motion.section {...fadeUp(0)} className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
            <Ordinal n="04" />
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-axel-ink tracking-tight mb-5">
                People can't be ranked.
                Signals can be compared.
              </h2>
              <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg max-w-2xl">
                <p>
                  Recruiting tools love to score candidates. 87% match. 4.2 stars. We find this
                  approach reductive and often harmful. A score creates false precision. It buries
                  the reasoning. It makes a human decision feel like a math problem.
                </p>
                <p>
                  Axel produces signals. It looks at what a candidate has actually done — the
                  systems they've owned, the scale they've operated at, the decisions they've made —
                  and extracts meaningful indicators of fit. Then it explains its reasoning in
                  plain language.
                </p>
                <p>
                  The decision is yours. Always. Axel's job is to give you everything you need to
                  make a well-informed decision quickly — not to make the decision for you.
                  Human judgment belongs in hiring. We built a system that respects that.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* 05: Closing */}
          <motion.section {...fadeUp(0)} className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-axel-ink tracking-tight mb-6">
              We're building the recruiting
              infrastructure the best teams deserve.
            </h2>
            <div className="space-y-4 text-stone-600 font-light leading-relaxed text-lg mb-10">
              <p>
                Axel exists because we believe hiring can be rigorous without being transactional,
                fast without being sloppy, and systematic without losing its humanity.
              </p>
              <p>
                If you're building something worth joining — and you need help finding people
                ambitious enough to join it — we built this for you.
              </p>
            </div>
            <motion.div {...fadeUp(0.08)}>
              <Link
                to="/access"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors"
              >
                Apply for early access <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.section>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
