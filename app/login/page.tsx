'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getRedirectUrl() {
  if (typeof window === 'undefined') return '/auth/callback';
  return `${window.location.origin}/auth/callback`;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for a magic link to sign in.');
    }

    setLoading(false);
  }

  const isSuccess =
    message && message.toLowerCase().includes('magic link');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-4 py-10 md:flex-row md:items-center md:px-8">
        
        {/* Left Branding / Messaging */}
        <section className="flex-1 space-y-6">
          <div className="inline-flex items-center rounded-full border border-slate-800/80 bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Aligned
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
              Evidence for every executive hire.
            </h1>
            <p className="max-w-xl text-sm text-slate-400 md:text-base">
              Aligned turns recruiter notes and call transcripts into
              decision-ready candidate reports for private equity operating
              partners. Every summary starts with your value-creation
              plan and ends with a clear yes, no, or not yet.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-slate-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-emerald-400" />
              <span>Built for PE operating partners and portfolio leaders.</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-sky-400" />
              <span>Turns messy recruiter inputs into structured, comparable evidence.</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-amber-400" />
              <span>Built for recruiters. Trusted by operating partners.</span>
            </div>
          </div>
        </section>

        {/* Right Login Card */}
        <section className="flex-1">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/40 backdrop-blur">
            <header className="mb-6 space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Sign in
              </p>
              <h2 className="text-xl font-semibold text-slate-50">
                Sign in to Aligned
              </h2>
              <p className="text-xs text-slate-400">
                Use your work email to get a secure magic link. This is how you
                access and share decision-ready candidate reports with your
                operating partners.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-200"
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-0 placeholder:text-slate-500 focus:border-slate-300 focus:ring-1 focus:ring-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending magic link…' : 'Send magic link'}
              </button>
            </form>

            {message && (
              <p
                className={`mt-4 text-xs ${
                  isSuccess ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
