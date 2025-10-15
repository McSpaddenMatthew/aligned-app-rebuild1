// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const next = useSearchParams().get('next') || '/dashboard';
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setLoading(false);
    if (!error) setSent(true);
  }

  return (
    <div className="min-h-[60vh] grid place-items-center p-8">
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4">
        {/* 🔧 Change headline/copy freely — does not affect auth */}
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-slate-600">Sign in via magic link. No passwords, no loops.</p>

        {sent ? (
          <div className="rounded-lg border p-4">
            Check your email for the sign-in link. After you click it, you’ll land on your dashboard.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border px-3 py-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border px-4 py-2 font-medium hover:bg-black hover:text-white transition"
            >
              {loading ? 'Sending…' : 'Email me a magic link'}
            </button>
          </form>
        )}

        <button
          onClick={() => router.push('/')}
          className="text-sm text-slate-500 underline underline-offset-4"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}



