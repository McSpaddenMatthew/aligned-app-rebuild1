'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow">
        {!sent ? (
          <>
            <h1 className="mb-4 text-center text-2xl font-semibold">Sign in</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 text-slate-900"
                required
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-black py-2 text-white hover:bg-slate-800"
              >
                Send Magic Link
              </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </>
        ) : (
          <p className="text-center text-slate-700">
            A magic link has been sent to <strong>{email}</strong>.
          </p>
        )}
      </div>
    </main>
  );
}

