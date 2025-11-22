'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getRedirectUrl() {
  if (typeof window === 'undefined') return undefined;
  const origin = window.location.origin;
  return `${origin}/auth/callback`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getRedirectUrl() },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the magic link.');
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,115,50,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.05),transparent_30%)]" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-10 shadow-2xl ring-1 ring-slate-200 backdrop-blur">
          <div className="mb-8 flex items-center gap-2 text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-semibold text-white shadow-sm">A</span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Aligned</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">Sign in to Aligned</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Hiring decisions need evidence. Recruiters need trust.
            </p>
          </div>

          <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-800">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="you@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending magic link…' : 'Send magic link'}
            </button>

            {message && (
              <p
                className={`text-center text-xs ${
                  message.toLowerCase().includes('magic link')
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <p className="mt-10 text-center text-xs text-slate-500">
            No passwords. Just a secure magic link to your inbox.
          </p>
        </div>
      </div>
    </main>
  );
}
