import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiteNavbar } from '../components/site/SiteNavbar';
import { SiteFooter } from '../components/site/SiteFooter';
import { WorkflowCanvas } from '../components/workflow/WorkflowCanvas';

// ─── Product mockups (one per step) ──────────────────────────────────────────

function MockRoleForm() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm text-sm space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Role Setup</p>
      {[
        { label: 'Role title',    value: 'Senior Backend Engineer'       },
        { label: 'Company',       value: 'Acme Corp · Series A · 45 ppl' },
        { label: 'Location',      value: 'Bangalore, India'              },
        { label: 'Budget',        value: '₹30–40 LPA'                   },
        { label: 'Growth context',value: 'Scaling payments infra 3×'    },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-[10px] text-stone-400 mb-0.5">{label}</p>
          <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-700 text-xs">{value}</div>
        </div>
      ))}
    </div>
  );
}

function MockAdvisory() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Hiring Advisory</p>
      <p className="text-xs text-stone-700 leading-relaxed">
        "Focus on engineers with 4–8 years at B2B SaaS or fintech in Bangalore.
        Avoid Big Tech senior bands. Look for end-to-end ownership signals."
      </p>
      <div>
        <p className="text-[10px] text-stone-400 mb-2">Target companies</p>
        <div className="flex flex-wrap gap-1.5">
          {['Razorpay', 'Chargebee', 'Hasura', 'Postman'].map(c => (
            <span key={c} className="px-2 py-0.5 bg-axel-50 text-axel-500 text-[10px] font-medium rounded border border-axel-100">{c}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-stone-400 mb-1">Signals to prioritize</p>
        <ul className="space-y-1">
          {['Open-source contributions', 'Led migrations or architecture decisions', 'On-call ownership'].map(s => (
            <li key={s} className="flex items-center gap-1.5 text-[10px] text-stone-600">
              <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />{s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MockApproval() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Sourcing Plan</p>
      <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-600 leading-relaxed">
        3 GitHub queries · Internal DB filter · LinkedIn passive reach
        <br />
        <span className="text-stone-400">Estimated: 20–35 candidates</span>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 bg-axel-500 text-white rounded-lg py-2 text-xs font-semibold">
          Approve &amp; source →
        </button>
        <button className="flex-1 border border-stone-200 text-stone-600 rounded-lg py-2 text-xs">
          Refine strategy
        </button>
      </div>
    </div>
  );
}

function MockSourcing() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Sourcing Progress</p>
      {[
        { source: 'GitHub queries',    count: 9,  color: 'bg-axel-500'    },
        { source: 'Internal database', count: 23, color: 'bg-emerald-500' },
        { source: 'LinkedIn passive',  count: 4,  color: 'bg-amber-500'   },
      ].map(({ source, count, color }) => (
        <div key={source}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-stone-600">{source}</span>
            <span className="font-semibold text-stone-800">{count} found</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(count / 30) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-full rounded-full ${color}`}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-stone-100 text-xs font-semibold text-stone-900">36 total candidates sourced</div>
    </div>
  );
}

function MockAnalysis() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Pipeline Alignment</p>
      {[
        { label: 'High Signal',      count: 3, color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
        { label: 'Good Signal',      count: 6, color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-700'     },
        { label: 'Worth Exploring',  count: 8, color: 'bg-violet-500',  light: 'bg-violet-50 text-violet-700'   },
        { label: 'No fit',           count: 19, color: 'bg-stone-300',  light: 'bg-stone-50 text-stone-500'     },
      ].map(({ label, count, color, light }) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-stone-600">{label}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${light}`}>{count}</span>
        </div>
      ))}
    </div>
  );
}

function MockOutreach() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Outreach Draft</p>
      <div className="text-xs text-stone-500 space-y-0.5">
        <p><span className="text-stone-400">To:</span> Arjun Mehta · arjun@razorpay.com</p>
        <p><span className="text-stone-400">Subject:</span> Backend infrastructure role at Acme</p>
      </div>
      <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-700 leading-relaxed border border-stone-100">
        "Hi Arjun — I noticed your work on payment infrastructure at Razorpay. We're
        building similar systems at Acme at a scale where your background would be
        a natural fit. Would you be open to a conversation?"
      </div>
      <div className="flex gap-2">
        <button className="flex-1 bg-axel-500 text-white rounded-lg py-1.5 text-xs font-semibold">Send</button>
        <button className="flex-1 border border-stone-200 text-stone-600 rounded-lg py-1.5 text-xs">Edit</button>
      </div>
    </div>
  );
}

function MockInbox() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3">Candidate Responses</p>
      {[
        { name: 'Arjun Mehta',      msg: '"Sounds interesting — tell me more."',   time: '2h ago',  dot: 'bg-emerald-500' },
        { name: 'Priya V.',         msg: '"Open to exploring, can we chat this week?"', time: '5h ago', dot: 'bg-emerald-500' },
        { name: 'Karan Shah',       msg: '"Currently in notice period, reaching out again in 3 weeks."', time: '1d ago', dot: 'bg-amber-500' },
      ].map(({ name, msg, time, dot }) => (
        <div key={name} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-stone-50 border border-stone-100">
          <span className={`w-2 h-2 rounded-full ${dot} mt-1.5 shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-900">{name}</p>
            <p className="text-[10px] text-stone-500 truncate">{msg}</p>
          </div>
          <span className="text-[10px] text-stone-400 shrink-0">{time}</span>
        </div>
      ))}
    </div>
  );
}

function MockCoordination() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-sm space-y-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Next Steps</p>
      <div className="bg-axel-50 border border-axel-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-axel-700 mb-0.5">Technical Screen · Arjun Mehta</p>
        <p className="text-[10px] text-axel-600">Wednesday, 11am IST · 60 min · Google Meet</p>
      </div>
      <div className="space-y-2">
        {[
          { action: 'Briefing prepared for interviewer', done: true  },
          { action: 'Interview questions generated',     done: true  },
          { action: 'Calendar invite sent to both',      done: true  },
          { action: 'Post-call debrief scheduled',       done: false },
        ].map(({ action, done }) => (
          <div key={action} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${done ? 'text-emerald-500' : 'text-stone-300'}`} />
            <span className={done ? 'text-stone-700' : 'text-stone-400'}>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Workflow steps data ──────────────────────────────────────────────────────
const STEPS = [
  {
    n:       '01',
    title:   'You describe the role',
    body:    'Tell Axel your company, role, growth context, budget, and location. That\'s all the input required. Axel takes it from here.',
    details: ['~2 minutes of setup', 'Plain text or structured input', 'Company context is used throughout'],
    Mockup:  MockRoleForm,
  },
  {
    n:       '02',
    title:   'Axel creates a hiring strategy',
    body:    'Before sourcing anyone, Axel writes a complete advisory: target companies, ideal titles, talent pool reasoning, and the signals that matter most for this specific role.',
    details: ['Strategy created by Claude AI', 'Grounded in your company context', 'Target companies with reasoning'],
    Mockup:  MockAdvisory,
  },
  {
    n:       '03',
    title:   'You review and approve',
    body:    'Axel shows you the plan before executing. You approve, ask for refinements, or adjust constraints. You\'re always in control of what gets sourced.',
    details: ['Full transparency before sourcing', 'Approve or refine in one click', 'Humans decide, Axel executes'],
    Mockup:  MockApproval,
  },
  {
    n:       '04',
    title:   'Axel sources candidates',
    body:    'With the strategy locked, Axel queries GitHub, searches your internal database, and surfaces passive candidates from LinkedIn — all in parallel.',
    details: ['GitHub · Internal DB · LinkedIn', '20–40 candidates in minutes', 'Deduplication handled automatically'],
    Mockup:  MockSourcing,
  },
  {
    n:       '05',
    title:   'Candidates are analyzed and grouped',
    body:    'Every candidate is analyzed against the role intelligence: signals, trajectory, ownership indicators, and alignment. Then grouped by signal strength.',
    details: ['High Signal / Good Signal / Exploring', 'No blind scoring — signal extraction', 'Reasoning attached to every decision'],
    Mockup:  MockAnalysis,
  },
  {
    n:       '06',
    title:   'Axel sends personalized outreach',
    body:    'Axel drafts and sends personalized outreach to matched candidates — referencing their actual work, not a generic template. Each message is reviewed before sending.',
    details: ['Personalized to candidate\'s background', 'Review before send', 'Tracked for opens and replies'],
    Mockup:  MockOutreach,
  },
  {
    n:       '07',
    title:   'Interested candidates enter your pipeline',
    body:    'Responses flow back into Axel\'s inbox. Interested candidates are automatically moved to pipeline with their full context. You see only warm leads.',
    details: ['Responses sorted by signal strength', 'Full conversation context attached', 'No manual inbox management'],
    Mockup:  MockInbox,
  },
  {
    n:       '08',
    title:   'Axel coordinates next steps',
    body:    'For candidates advancing to interviews, Axel prepares briefings, generates interview questions, schedules calls, and queues the post-call debrief.',
    details: ['Interview briefings auto-generated', 'Calendar coordination handled', 'Debrief and decision tracking'],
    Mockup:  MockCoordination,
  },
] as const;

// ─── Step component ───────────────────────────────────────────────────────────
function WorkflowStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const { n, title, body, details, Mockup } = step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: 0.05, type: 'spring', stiffness: 200, damping: 28 }}
      className="grid md:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center py-16 lg:py-20 border-b border-stone-200/40 last:border-0"
    >
      {/* Text (even steps: swap order on desktop) */}
      <div className={index % 2 === 1 ? 'md:order-2' : ''}>
        <div className="flex items-baseline gap-4 mb-4">
          <span className="font-display font-light text-7xl text-stone-100 leading-none select-none">{n}</span>
          <div className="w-px h-8 bg-stone-200" />
          <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Step {n}</span>
        </div>
        <h3 className="text-2xl lg:text-3xl font-extrabold font-display text-axel-ink tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-stone-500 font-light leading-relaxed mb-5 text-base">{body}</p>
        <ul className="space-y-2">
          {details.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-axel-400 mt-1.5 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Mockup (even steps: swap order on desktop) */}
      <div className={`${index % 2 === 1 ? 'md:order-1' : ''} max-w-sm mx-auto w-full`}>
        <Mockup />
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkflowPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SiteNavbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-white border-b border-stone-200/60">
          <div className="max-w-screen-xl mx-auto px-6 py-20 lg:py-28">
            <div className="max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4"
              >
                End-to-end workflow
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 28 }}
                className="text-5xl lg:text-6xl font-extrabold font-display leading-[1.05] tracking-tight text-axel-ink mb-6"
              >
                Every hire,
                <br />fully orchestrated.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="text-xl text-stone-500 font-light leading-relaxed mb-8 max-w-xl"
              >
                From role description to interview scheduling — 8 steps, fully autonomous.
                Axel runs the recruiting workflow so you can run the company.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
                className="flex items-center gap-4 flex-wrap text-sm text-stone-500"
              >
                {['~45 minutes end-to-end', 'No manual sourcing', 'Decision-ready pipeline'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Execution canvas */}
        <section className="bg-stone-50 border-b border-stone-200/60">
          <div className="max-w-screen-xl mx-auto px-6 py-14">
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-6">
              Execution canvas — live demo
            </p>
            <WorkflowCanvas demo />
          </div>
        </section>

        {/* Steps — detailed walkthrough */}
        <section className="max-w-screen-xl mx-auto px-6">
          {STEPS.map((step, i) => (
            <WorkflowStep key={step.n} step={step} index={i} />
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-stone-200/60">
          <div className="max-w-screen-xl mx-auto px-6 py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold font-display text-axel-ink tracking-tight mb-4"
            >
              See Axel think for your role.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-lg text-stone-500 font-light mb-8"
            >
              Try the advisory demo — describe a role and see the hiring strategy Axel creates.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="flex items-center gap-4 justify-center flex-wrap"
            >
              <Link
                to="/advisory"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors shadow-sm"
              >
                Try the advisory <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/access"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Apply for access
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
