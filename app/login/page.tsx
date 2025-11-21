'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function getRedirectUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}/auth/callback`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for a magic login link.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Aligned</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome to your hiring command center.
          </h1>
          <p className="max-w-2xl text-lg text-slate-200/80">
            Streamline outreach, track candidates, and collaborate with your team in a single, secure workspace.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>Secure magic-link sign in</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
              <span>Works with your inbox</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="mb-6 space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Sign in</h2>
              <p className="text-sm text-slate-200/80">We&apos;ll send a magic link to your email.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100" htmlFor="email">
                  Work email
                </label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <button
                className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending magic link...' : 'Send magic link'}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-center text-sm text-slate-100/90">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
