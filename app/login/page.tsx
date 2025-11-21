'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'https://aligned.vercel.app/auth/callback';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setStatus('error');
      return;
    }

    setStatus('sent');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          Sign in to Aligned
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Use your work email to get a secure magic link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              placeholder="you@company.com"
            />
          </label>

          <button
            type="submit"
            disabled={status === 'sending' || !email}
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending link…' : 'Send magic link'}
          </button>
        </form>

        {status === 'sent' && (
          <p className="mt-4 text-center text-sm text-emerald-600">
            Magic link sent. Check your email and click the link to finish signing in.
          </p>
        )}

        {status === 'error' && error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </main>
  );
}
