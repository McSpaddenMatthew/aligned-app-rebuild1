'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const redirectTo = window.location.origin; // https://aligned.vercel.app

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo, // magic link comes back to "/"
        },
      });

      if (error) {
        console.error(error);
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      setStatus('sent');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message ?? 'Something went wrong.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-md border border-slate-200">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900 text-center">
          Sign in to Aligned
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Use your work email to get a secure magic link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending link…' : 'Send magic link'}
          </button>
        </form>

        {status === 'sent' && (
          <p className="mt-4 text-sm text-emerald-600 text-center">
            Magic link sent. Check your email and click the link to continue.
          </p>
        )}

        {status === 'error' && (
          <p className="mt-4 text-sm text-red-600 text-center">
            {errorMessage ?? 'Something went wrong sending your magic link.'}
          </p>
        )}
      </div>
    </main>
  );
}

