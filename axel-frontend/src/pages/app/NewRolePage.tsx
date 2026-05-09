/**
 * NewRolePage — /app/new
 * Intent-first role form. Focused on context, not requirements.
 * Navigates to /app/run/:runId?role=:roleId on submit.
 */
import { useState }               from 'react';
import { useNavigate }             from 'react-router-dom';
import { AppShell }                from '../../components/app/AppShell';
import { createRole, startPipeline } from '../../lib/api';

type FormState = {
  company:          string;
  title:            string;
  location:         string;
  budget_lpa:       string;
  experience_range: string;
  brief:            string;
  why_join:         string;
  problems:         string;
  exciting:         string;
  ambition_profile: string;
};

const EMPTY: FormState = {
  company:          '',
  title:            '',
  location:         'Bangalore, India',
  budget_lpa:       '',
  experience_range: '',
  brief:            '',
  why_join:         '',
  problems:         '',
  exciting:         '',
  ambition_profile: '',
};

function buildRolePrompt(f: FormState): string {
  const parts: string[] = [];

  if (f.title)            parts.push(`Role: ${f.title}`);
  if (f.brief)            parts.push(f.brief.trim());
  if (f.why_join)         parts.push(`Why join this company:\n${f.why_join.trim()}`);
  if (f.problems)         parts.push(`Problems this person will solve:\n${f.problems.trim()}`);
  if (f.exciting)         parts.push(`What makes this genuinely exciting:\n${f.exciting.trim()}`);
  if (f.ambition_profile) parts.push(`Ambition profile we are looking for:\n${f.ambition_profile.trim()}`);

  return parts.join('\n\n');
}

export default function NewRolePage() {
  const navigate = useNavigate();
  const [form,     setForm]     = useState<FormState>(EMPTY);
  const [status,   setStatus]   = useState<'idle' | 'creating' | 'starting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('creating');
    setErrorMsg('');
    try {
      const role = await createRole({
        company:     form.company,
        role_prompt: buildRolePrompt(form),
        constraints: {
          budget_lpa:       parseFloat(form.budget_lpa) || 0,
          location:         form.location,
          experience_range: form.experience_range,
        },
      });
      setStatus('starting');
      const { run_id } = await startPipeline(role.id);
      navigate(`/app/run/${run_id}?role=${role.id}`);
    } catch (err) {
      setErrorMsg((err as Error).message ?? 'Something went wrong');
      setStatus('error');
    }
  }

  const busy = status === 'creating' || status === 'starting';

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <p className="text-[10px] font-mono text-stone-600 tracking-widest uppercase mb-5">
          New run
        </p>
        <h1 className="text-xl font-semibold text-stone-100 mb-1.5">
          Tell Axel what you are trying to build.
        </h1>
        <p className="text-sm text-stone-500 mb-10 leading-relaxed">
          The more context you give, the sharper the sourcing and the more relevant the candidates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Context ─────────────────────────────────────────────────── */}
          <FormSection label="Context">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company" required>
                <input value={form.company} onChange={e => set('company', e.target.value)}
                  placeholder="Acme Corp" required className={INPUT} />
              </Field>
              <Field label="Role title">
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="Senior Backend Engineer" className={INPUT} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Location">
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="Bangalore, India" className={INPUT} />
              </Field>
              <Field label="Budget (LPA)">
                <input type="number" value={form.budget_lpa}
                  onChange={e => set('budget_lpa', e.target.value)}
                  placeholder="30" className={INPUT} />
              </Field>
              <Field label="Experience range">
                <input value={form.experience_range}
                  onChange={e => set('experience_range', e.target.value)}
                  placeholder="4–8 years" className={INPUT} />
              </Field>
            </div>
          </FormSection>

          {/* ── What you're building ─────────────────────────────────────── */}
          <FormSection label="What you are building">
            <Field label="Hiring brief" required
              hint="What does this person actually own? What decisions do they make?">
              <textarea value={form.brief} onChange={e => set('brief', e.target.value)}
                required rows={5}
                placeholder="We are building payments infrastructure from scratch. This person will own architecture decisions — not just contribute, but decide how our payments layer scales for the next 3 years."
                className={`${INPUT} resize-none leading-relaxed`} />
            </Field>

            <Field label="Why join this company"
              hint="What makes this company worth someone's career capital?">
              <textarea value={form.why_join} onChange={e => set('why_join', e.target.value)}
                rows={3}
                placeholder="We are a Series A fintech with a real shot at owning SME payments in Southeast Asia. Engineers here will shape how the system works, not inherit a legacy."
                className={`${INPUT} resize-none leading-relaxed`} />
            </Field>

            <Field label="Problems to solve"
              hint="What hard, specific problems will this person face in the first year?">
              <textarea value={form.problems} onChange={e => set('problems', e.target.value)}
                rows={3}
                placeholder="Redesigning our settlement layer to handle 10x volume. Eliminating manual reconciliation that currently takes 3 engineers 2 days each month."
                className={`${INPUT} resize-none leading-relaxed`} />
            </Field>
          </FormSection>

          {/* ── Ambition ─────────────────────────────────────────────────── */}
          <FormSection label="Ambition">
            <Field label="What makes this genuinely exciting"
              hint="Not the job description version. The real version.">
              <textarea value={form.exciting} onChange={e => set('exciting', e.target.value)}
                rows={3}
                placeholder="You would be the 4th engineer. Everything you build becomes infrastructure for the next 50 engineers. The architecture decisions you make now will still matter in 5 years."
                className={`${INPUT} resize-none leading-relaxed`} />
            </Field>

            <Field label="Ideal ambition profile"
              hint="What is this person trying to become? What kind of career move does this enable?">
              <textarea value={form.ambition_profile}
                onChange={e => set('ambition_profile', e.target.value)}
                rows={3}
                placeholder="Someone who has been a strong IC and wants their first real ownership. Not a manager — an architect. Someone who cares deeply about how systems work at scale."
                className={`${INPUT} resize-none leading-relaxed`} />
            </Field>
          </FormSection>

          {/* ── Error ───────────────────────────────────────────────────── */}
          {status === 'error' && (
            <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-4 py-2.5">
              {errorMsg}
            </p>
          )}

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 pt-2 border-t border-stone-800">
            <button type="submit" disabled={busy}
              className="px-5 py-2.5 bg-stone-100 text-stone-900 text-sm font-semibold rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {status === 'creating' ? 'Building strategy…' :
               status === 'starting' ? 'Launching pipeline…' :
               'Run Axel →'}
            </button>
            {busy && (
              <p className="text-xs text-stone-500">
                {status === 'creating'
                  ? 'Axel is reading your context and building a sourcing plan.'
                  : 'Pipeline started. Opening board…'}
              </p>
            )}
          </div>

        </form>
      </div>
    </AppShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest pb-2 border-b border-stone-800/60">
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-mono text-stone-500 uppercase tracking-widest">
        {label}{required && <span className="text-stone-700 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-stone-600">{hint}</p>}
    </div>
  );
}

const INPUT =
  'bg-stone-900 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-stone-600 transition-colors w-full';
