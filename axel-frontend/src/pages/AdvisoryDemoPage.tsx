import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { SiteNavbar } from '../components/site/SiteNavbar';
import { SiteFooter } from '../components/site/SiteFooter';

// ─── Mock advisory data per role type ────────────────────────────────────────
interface AdvisoryData {
  strategy:     string;
  targetCompanies: { name: string; reason: string }[];
  targetTitles: string[];
  talentPool:   string;
  constraints:  string;
  signals:      string[];
  questions:    string[];
}

const ADVISORIES: Record<string, AdvisoryData> = {
  backend: {
    strategy:
      'Focus on engineers with 4–8 years at B2B SaaS or fintech companies in your target location. Avoid Big Tech senior bands — they\'ll be overpriced and underexcited. Prioritize candidates who\'ve owned systems end-to-end at startup scale, shown by architecture decisions, on-call ownership, or leading migrations.',
    targetCompanies: [
      { name: 'Razorpay',   reason: 'Distributed systems at fintech scale, strong backend culture' },
      { name: 'Chargebee',  reason: 'B2B SaaS background, subscription infrastructure depth' },
      { name: 'Hasura',     reason: 'GraphQL/API expertise, developer-tools mindset' },
      { name: 'Postman',    reason: 'API-first culture, strong mid-level backend talent' },
      { name: 'Nilenso',    reason: 'Consulting background = exposure to many codebases, great problem solvers' },
    ],
    targetTitles: ['Senior Software Engineer', 'Backend Engineer', 'Platform Engineer', 'SDE-II / SDE-III'],
    talentPool:
      'Engineers who\'ve built production systems at meaningful scale, worked in small teams with direct ownership (not just tickets). Strong signal: active GitHub, postmortem authorship, has pushed a feature from design to production without handoffs.',
    constraints:
      'Your budget positions you competitively against mid-stage startups but not Big Tech. This is your advantage — engineers who\'ve outgrown corporate structure but aren\'t ready to start their own company. Lean into your growth story and ownership culture.',
    signals: [
      'Open-source contributions to backend or infra tooling',
      'Led or co-authored architectural decisions',
      'On-call rotation — has dealt with production incidents',
      'Has shipped a feature end-to-end without hand-holding',
    ],
    questions: [
      'What\'s the largest system you\'ve owned from design to production? What broke, and how did you fix it?',
      'Walk me through a time you disagreed with an architectural decision and what happened.',
      'How do you think about technical debt at startup scale?',
    ],
  },
  product: {
    strategy:
      'Look for product managers with B2B SaaS or platform product experience. Prioritize those who\'ve shipped products with measurable business impact — ARR, retention, activation — not just shipped features. Avoid candidates with only consumer PM backgrounds unless they explicitly want to transition.',
    targetCompanies: [
      { name: 'Chargebee',  reason: 'B2B SaaS product sense with billing/revenue context' },
      { name: 'Freshworks',  reason: 'Strong product culture, SMB-to-enterprise product thinking' },
      { name: 'Zoho',       reason: 'Deep product operational experience, cost-conscious DNA' },
      { name: 'Clevertap',  reason: 'Analytics-driven product thinking' },
      { name: 'Browserstack', reason: 'Developer-first product mindset' },
    ],
    targetTitles: ['Product Manager', 'Senior PM', 'Product Lead', 'Associate Director of Product'],
    talentPool:
      'PMs who think in systems, not features. Look for evidence of cross-functional influence, customer obsession, and ability to operate with engineering depth. Bonus: has shipped a product at a startup where resources were constrained.',
    constraints:
      'Budget-wise, you\'re in the range where early-career PMs want to grow fast and mid-career PMs want ownership. Position the role as a chance to own a product area with real autonomy — not manage a backlog.',
    signals: [
      'Can articulate the metrics behind their last 3 product decisions',
      'Has worked directly with engineering — not just through tickets',
      'Has done customer discovery, not just market research',
      'Shipped and killed features based on data',
    ],
    questions: [
      'Tell me about a product decision you made where the data was ambiguous. What did you do?',
      'What\'s a feature you shipped that didn\'t work as expected? What did you learn?',
      'How do you decide what to NOT build?',
    ],
  },
  default: {
    strategy:
      'Prioritize candidates with proven experience in a similar scope and stage. Look for ownership signals — has led a team, shipped projects end-to-end, made decisions under constraint. Avoid candidates who\'ve only worked in large-org contexts where individual impact is hard to isolate.',
    targetCompanies: [
      { name: 'Similar-stage startups', reason: 'Stage-matched experience — understands startup constraints' },
      { name: 'Early-stage of known companies', reason: 'Was there when the role was harder, proven in lean environments' },
      { name: 'Consulting / agency background', reason: 'Broad exposure, comfortable with ambiguity' },
    ],
    targetTitles: ['Senior IC', 'Lead', 'Manager', 'Individual Contributor with leadership exposure'],
    talentPool:
      'People who\'ve done more with less. The best candidates for early-stage companies are those who\'ve had to figure things out without a playbook. Look for this in their stories — not their titles.',
    constraints:
      'Your budget needs to be positioned against what you\'re offering beyond comp: ownership, growth, mission. Be clear and honest about stage. The right candidate will be excited by constraints, not deterred.',
    signals: [
      'Has shipped something from 0 to production',
      'Can tell you what went wrong and what they\'d do differently',
      'Has hired or mentored someone else',
      'Has operated in resource-constrained environment',
    ],
    questions: [
      'Tell me about the thing you\'re most proud of building. What\'s the context behind it?',
      'What\'s a mistake you made that shaped how you work now?',
      'What would you do in your first 30 days here?',
    ],
  },
};

function getAdvisory(role: string): AdvisoryData {
  const r = role.toLowerCase();
  if (r.includes('backend') || r.includes('engineer') || r.includes('software') || r.includes('platform')) {
    return ADVISORIES.backend;
  }
  if (r.includes('product') || r.includes('pm ') || r.includes(' pm') || r.includes('manager')) {
    return ADVISORIES.product;
  }
  return ADVISORIES.default;
}

// ─── Advisory Output component ────────────────────────────────────────────────
function AdvisoryOutput({
  role,
  company,
  data,
}: {
  role:    string;
  company: string;
  data:    AdvisoryData;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">Hiring Advisory</p>
            <h3 className="font-extrabold font-display text-axel-ink text-xl tracking-tight">{role}</h3>
            <p className="text-sm text-stone-500">{company}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Advisory ready
          </span>
        </div>
      </div>

      {/* Strategy */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3">Sourcing Strategy</p>
        <p className="text-sm text-stone-700 leading-relaxed">{data.strategy}</p>
      </div>

      {/* Target companies */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-4">Target Companies</p>
        <div className="space-y-3">
          {data.targetCompanies.map(({ name, reason }) => (
            <div key={name} className="flex items-start gap-3">
              <span className="px-2.5 py-1 bg-axel-50 text-axel-500 text-xs font-semibold rounded-lg border border-axel-100 shrink-0">{name}</span>
              <p className="text-xs text-stone-500 leading-relaxed pt-1">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Titles + Talent pool */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3">Target Titles</p>
          <ul className="space-y-1.5">
            {data.targetTitles.map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs text-stone-700">
                <span className="w-1.5 h-1.5 rounded-full bg-axel-400 shrink-0" />{t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3">Constraints Analysis</p>
          <p className="text-xs text-stone-600 leading-relaxed">{data.constraints}</p>
        </div>
      </div>

      {/* Talent pool */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3">Talent Pool Profile</p>
        <p className="text-sm text-stone-700 leading-relaxed">{data.talentPool}</p>
        <div className="mt-4 pt-4 border-t border-stone-100">
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">Signals to look for</p>
          <ul className="space-y-1.5">
            {data.signals.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interview questions */}
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-4">Interview Questions</p>
        <ol className="space-y-3">
          {data.questions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed">
              <span className="text-xs font-semibold text-axel-400 shrink-0 mt-0.5">{i + 1}.</span>
              {q}
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="bg-axel-500 rounded-2xl p-6 text-center">
        <p className="font-extrabold font-display text-white text-xl tracking-tight mb-2">
          Run this for real.
        </p>
        <p className="text-axel-100/80 text-sm font-light mb-5">
          This is a preview. With early access, Axel actually sources, analyzes, and delivers candidates against this strategy.
        </p>
        <Link
          to="/access"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-axel-500 text-sm font-semibold hover:bg-axel-50 transition-colors"
        >
          Apply for early access <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
interface DemoFormData {
  role:     string;
  company:  string;
  stage:    string;
  budget:   string;
  location: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdvisoryDemoPage() {
  const [advisory, setAdvisory] = useState<{ role: string; company: string; data: AdvisoryData } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);

  const GENERATING_STEPS = [
    'Parsing role context...',
    'Identifying target talent pool...',
    'Mapping target companies...',
    'Analyzing constraints...',
    'Generating interview signals...',
    'Advisory ready.',
  ];

  const { register, handleSubmit, formState: { errors } } = useForm<DemoFormData>();

  const onSubmit = async (data: DemoFormData) => {
    setGenerating(true);
    setAdvisory(null);
    setStep(0);

    // Simulate generation steps
    for (let i = 0; i < GENERATING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 550));
      setStep(i + 1);
    }

    await new Promise(r => setTimeout(r, 300));
    setGenerating(false);
    setAdvisory({
      role:    data.role,
      company: data.company,
      data:    getAdvisory(data.role),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SiteNavbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-white border-b border-stone-200/60">
          <div className="max-w-screen-xl mx-auto px-6 py-20 lg:py-24">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4"
              >
                Advisory demo
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 28 }}
                className="text-5xl lg:text-6xl font-extrabold font-display leading-[1.05] tracking-tight text-axel-ink mb-5"
              >
                See Axel think.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="text-xl text-stone-500 font-light leading-relaxed"
              >
                Describe a role. Get a complete hiring strategy — target companies, talent pool
                reasoning, constraints analysis, and interview signals.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Form + Output */}
        <section className="max-w-screen-xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-[400px_1fr] gap-10 items-start">

            {/* Form */}
            <div className="lg:sticky lg:top-24">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-5"
              >
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-4">Describe the role</p>
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1.5">Role title *</label>
                  <input
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-axel-500/30 focus:border-axel-400 transition-colors"
                    {...register('role', { required: true })}
                  />
                  {errors.role && <p className="text-xs text-rose-500 mt-1">Required</p>}
                </div>

                {/* Company */}
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1.5">Company *</label>
                  <input
                    placeholder="e.g. Acme Corp"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-axel-500/30 focus:border-axel-400 transition-colors"
                    {...register('company', { required: true })}
                  />
                  {errors.company && <p className="text-xs text-rose-500 mt-1">Required</p>}
                </div>

                {/* Stage */}
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1.5">Growth stage</label>
                  <select
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-axel-500/30 bg-white"
                    {...register('stage')}
                  >
                    <option value="">Select stage</option>
                    <option value="pre-seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b">Series B</option>
                    <option value="series-c">Series C+</option>
                    <option value="growth">Growth / Pre-IPO</option>
                  </select>
                </div>

                {/* Budget + Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1.5">Budget (LPA)</label>
                    <input
                      placeholder="e.g. 30–40"
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-axel-500/30"
                      {...register('budget')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1.5">Location</label>
                    <input
                      placeholder="e.g. Bangalore"
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-axel-500/30"
                      {...register('location')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating advisory...</>
                  ) : (
                    <>Generate advisory <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>

            {/* Output / Generating state */}
            <div>
              <AnimatePresence mode="wait">
                {generating && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                  >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-6">Axel is thinking...</p>
                    <div className="space-y-3">
                      {GENERATING_STEPS.slice(0, step).map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <p className="text-sm text-stone-700 font-mono">{s}</p>
                        </motion.div>
                      ))}
                      {step < GENERATING_STEPS.length && (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-axel-500 animate-spin shrink-0" />
                          <p className="text-sm text-stone-500 font-mono">{GENERATING_STEPS[step]}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {advisory && !generating && (
                  <motion.div key="output">
                    <AdvisoryOutput
                      role={advisory.role}
                      company={advisory.company}
                      data={advisory.data}
                    />
                  </motion.div>
                )}

                {!generating && !advisory && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-axel-50 border border-axel-100 flex items-center justify-center mb-4">
                      <span className="text-2xl font-display font-extrabold text-axel-500">A</span>
                    </div>
                    <p className="text-stone-500 text-sm font-light">
                      Fill in the role details to see how Axel thinks about hiring.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
