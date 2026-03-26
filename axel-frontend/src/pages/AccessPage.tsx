import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { SiteNavbar } from '../components/site/SiteNavbar';
import { SiteFooter } from '../components/site/SiteFooter';
import { useWaitlist } from '../hooks/useWaitlist';
import type { WaitlistEntry } from '../types';

const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth / Pre-IPO'] as const;
const URGENCY = ['This month', 'This quarter', 'This half-year', 'Within the year'] as const;
const BUDGETS = ['Under ₹20 LPA', '₹20–30 LPA', '₹30–50 LPA', '₹50–80 LPA', '₹80 LPA+', 'Flexible'] as const;

const CRITERIA = [
  'You\'re actively hiring or will be in the next 90 days',
  'You can describe what "great" looks like for your team',
  'You want recruiting to scale without adding headcount',
] as const;

export default function AccessPage() {
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync, isPending } = useWaitlist();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistEntry>();

  const onSubmit = async (data: WaitlistEntry) => {
    await mutateAsync(data);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SiteNavbar />
      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[400px_1fr] gap-16 lg:gap-24 items-start">

            {/* ── Left: Context ──────────────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              >
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="w-9 h-9 bg-axel-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-white" fill="white" />
                  </div>
                  <span className="font-extrabold font-display text-axel-ink text-lg tracking-tight">Axel</span>
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Early access</p>
                <h1 className="text-4xl font-extrabold font-display text-axel-ink tracking-tight leading-tight mb-5">
                  Apply to run
                  <br />your next hire
                  <br />on Axel.
                </h1>
                <p className="text-base text-stone-500 font-light leading-relaxed mb-8">
                  We're onboarding a select number of high-growth teams. We review every
                  application personally.
                </p>

                {/* Criteria */}
                <div className="bg-white rounded-xl border border-stone-200/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-3">
                    What we look for
                  </p>
                  <ul className="space-y-2.5">
                    {CRITERIA.map((c) => (
                      <li key={c} className="flex items-start gap-2.5 text-sm text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-sm text-stone-400 font-light">
                  We'll respond within 48 hours of your application.
                </p>
              </motion.div>
            </div>

            {/* ── Right: Form ──────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-stone-200/60 p-10 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold font-display text-axel-ink tracking-tight mb-3">
                    Application received.
                  </h2>
                  <p className="text-stone-500 font-light leading-relaxed max-w-sm mx-auto mb-6">
                    We'll review your application and reach out within 48 hours. We're excited to hear
                    more about what you're building.
                  </p>
                  <p className="text-sm text-stone-400">
                    In the meantime, explore the{' '}
                    <a href="/advisory" className="text-axel-500 hover:underline">advisory demo</a>
                    {' '}or read our{' '}
                    <a href="/philosophy" className="text-axel-500 hover:underline">philosophy</a>.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 28 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-white rounded-2xl border border-stone-200/60 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-8"
                >

                  {/* Company section */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-5">
                      About your company
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Company name *" error={!!errors.company_name}>
                        <input
                          placeholder="Acme Corp"
                          className={inputCls(!!errors.company_name)}
                          {...register('company_name', { required: true })}
                        />
                      </Field>
                      <Field label="Work email *" error={!!errors.email}>
                        <input
                          type="email"
                          placeholder="you@company.com"
                          className={inputCls(!!errors.email)}
                          {...register('email', { required: true })}
                        />
                      </Field>
                      <Field label="Growth stage">
                        <select className={inputCls(false)} {...register('stage')}>
                          <option value="">Select stage</option>
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="Company size">
                        <input
                          placeholder="e.g. 25 people"
                          className={inputCls(false)}
                          {...register('company_size')}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Role section */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-5">
                      About the hire
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Role you're hiring for *" error={!!errors.role}>
                        <input
                          placeholder="e.g. Senior Backend Engineer"
                          className={inputCls(!!errors.role)}
                          {...register('role', { required: true })}
                        />
                      </Field>
                      <Field label="Location">
                        <input
                          placeholder="e.g. Bangalore (or Remote)"
                          className={inputCls(false)}
                          {...register('location')}
                        />
                      </Field>
                      <Field label="Budget range">
                        <select className={inputCls(false)} {...register('budget')}>
                          <option value="">Select budget</option>
                          {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </Field>
                      <Field label="Hiring urgency">
                        <select className={inputCls(false)} {...register('hiring_urgency')}>
                          <option value="">Select timeframe</option>
                          {URGENCY.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>

                  {/* Key questions */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-5">
                      The important questions
                    </p>
                    <div className="space-y-4">
                      <Field
                        label="Why should great engineers join your team? *"
                        hint="What makes this the right moment to join your company?"
                        error={!!errors.why_join}
                      >
                        <textarea
                          rows={4}
                          placeholder="Tell us about your mission, what you're building, and why this is a career-defining opportunity..."
                          className={`${inputCls(!!errors.why_join)} resize-none`}
                          {...register('why_join', { required: true })}
                        />
                        {errors.why_join && <p className="text-xs text-rose-500 mt-1">This helps us understand your pitch to talent.</p>}
                      </Field>

                      <Field
                        label="Why do you want hiring on autopilot?"
                        hint="What's broken today? What would change if you could hire faster?"
                      >
                        <textarea
                          rows={3}
                          placeholder="Describe your current recruiting pain and what you'd do with more capacity..."
                          className={`${inputCls(false)} resize-none`}
                          {...register('description')}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-axel-500 text-white text-sm font-semibold hover:bg-axel-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isPending ? (
                        'Submitting...'
                      ) : (
                        <>Submit application <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                    <p className="text-xs text-stone-400 text-center mt-3">
                      We respond within 48 hours. No spam, ever.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return `w-full border rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400
    focus:outline-none focus:ring-2 focus:ring-axel-500/30 focus:border-axel-400
    transition-colors bg-white
    ${hasError ? 'border-rose-300' : 'border-stone-200'}`;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label:     string;
  hint?:     string;
  error?:    boolean;
  children:  React.ReactNode;
}) {
  return (
    <div>
      <label className={`text-xs font-medium block mb-1.5 ${error ? 'text-rose-500' : 'text-stone-700'}`}>
        {label}
      </label>
      {hint && <p className="text-[11px] text-stone-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
