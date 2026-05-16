/**
 * LoginPage — /login
 * Single admin entry point. Email + password via Supabase Auth.
 * On success, redirects to the page the user originally tried to reach
 * (or /app/new as the default).
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Preserve the intended destination across the redirect
  const from = (location.state as { from?: string } | null)?.from ?? '/app/new';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await login(email, password);

    setLoading(false);

    if (authError) {
      setError(authError);
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-10 text-center">
          <p className="text-[11px] font-mono font-bold tracking-widest text-stone-300">
            AXEL
          </p>
          <p className="text-stone-600 text-xs mt-1.5">
            Hiring intelligence. Sign in to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-[11px] text-stone-500 mb-1.5 tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="you@company.com"
              className="
                w-full bg-stone-900 border border-stone-800 rounded
                px-3 py-2.5 text-sm text-stone-100
                placeholder:text-stone-700
                focus:outline-none focus:border-stone-600
                transition-colors
              "
            />
          </div>

          <div>
            <label className="block text-[11px] text-stone-500 mb-1.5 tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="
                w-full bg-stone-900 border border-stone-800 rounded
                px-3 py-2.5 text-sm text-stone-100
                placeholder:text-stone-700
                focus:outline-none focus:border-stone-600
                transition-colors
              "
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full bg-stone-100 hover:bg-white text-stone-900 rounded
              px-4 py-2.5 text-sm font-medium
              transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              mt-2
            "
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

        </form>

        {/* Subtle footer */}
        <p className="text-center text-stone-700 text-[11px] mt-10">
          Axel — private access only
        </p>

      </div>
    </div>
  );
}
