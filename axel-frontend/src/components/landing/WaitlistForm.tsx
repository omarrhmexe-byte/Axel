import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Input, Textarea } from '../ui/Input';
import { Button }          from '../ui/Button';
import { useWaitlist }     from '../../hooks/useWaitlist';
import type { WaitlistEntry } from '../../types';

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending, error } = useWaitlist();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistEntry>();

  const onSubmit = (data: WaitlistEntry) =>
    mutate(data, { onSuccess: () => setSubmitted(true) });

  return (
    <section id="waitlist" className="bg-stone-50 border-t border-stone-200">
      <div className="max-w-2xl mx-auto px-6 py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-extrabold font-display tracking-tight text-stone-900 mb-3">
            Run your next hire on Axel.
          </h2>
          <p className="text-lg text-stone-500 font-light">
            We're onboarding teams selectively. Tell us who you're hiring for.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success ─────────────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-emerald-200 p-12 text-center shadow-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
                className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </motion.div>
              <h3 className="text-xl font-bold font-display text-stone-900 mb-2">
                You're in.
              </h3>
              <p className="text-stone-500">
                We'll be in touch soon.
              </p>
            </motion.div>
          ) : (
            /* ── Form ────────────────────────────────────────────── */
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-5"
            >
              {/* Row 1 */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Company name"
                  placeholder="Acme Inc."
                  hint="Your startup or company"
                  error={errors.company_name?.message}
                  {...register('company_name', { required: 'Required' })}
                />
                <Input
                  label="Work email"
                  type="email"
                  placeholder="you@company.com"
                  error={errors.email?.message}
                  {...register('email', { required: 'Required' })}
                />
              </div>

              {/* Role */}
              <Input
                label="Who are you hiring for?"
                placeholder="Senior Backend Engineer, Product Lead…"
                hint="The role you want Axel to fill"
                error={errors.role?.message}
                {...register('role', { required: 'Required' })}
              />

              {/* Row 2 */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Budget (LPA)"
                  type="number"
                  placeholder="30"
                  hint="Annual, in lakhs (₹)"
                  error={errors.budget_lpa?.message}
                  {...register('budget_lpa', {
                    required: 'Required',
                    valueAsNumber: true,
                  })}
                />
                <Input
                  label="Location"
                  placeholder="Bangalore / Remote"
                  error={errors.location?.message}
                  {...register('location', { required: 'Required' })}
                />
                <Input
                  label="Experience range"
                  placeholder="3–7 years"
                  error={errors.experience_range?.message}
                  {...register('experience_range', { required: 'Required' })}
                />
              </div>

              {/* Company description */}
              <Textarea
                label="Tell us about your company"
                rows={3}
                placeholder="We're a Series A fintech building infra for SMBs…"
                hint="What you're building and who you need."
                error={errors.company_description?.message}
                {...register('company_description', { required: 'Required' })}
              />

              {/* Why autopilot */}
              <Textarea
                label="Why do you want hiring on autopilot?"
                rows={2}
                placeholder="We're scaling fast and can't keep up with sourcing quality candidates…"
                {...register('why_autopilot')}
              />

              {/* Growth rate */}
              <Input
                label="Current growth rate (optional)"
                placeholder="2× YoY — hiring 20 engineers this quarter"
                hint="Helps Axel understand urgency and scale"
                {...register('growth_rate')}
              />

              {/* API error */}
              {error && (
                <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                  {(error as Error).message}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" loading={isPending}>
                Request access
              </Button>

              <p className="text-center text-xs text-stone-400">
                No spam, ever. We only reach out when Axel is ready for you.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
