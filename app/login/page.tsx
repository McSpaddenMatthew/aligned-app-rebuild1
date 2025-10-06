'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // IMPORTANT: send user to the callback page, with the post-login destination
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
      }
    });

    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow">
        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h1 className="mb-4 text-center text-2xl font-semibold">Sign in</h1>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border px-4 py-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-black py-2 text-white hover:bg-slate-800">
              Send Magic Link
            </button>
          </form>
        ) : (
          <div className="text-center text-slate-700">
            <p className="text-lg font-medium">Check your email</p>
            <p className="text-sm mt-2">A magic link has been sent to <strong>{email}</strong>.</p>
          </div>
        )}
      </div>
    </main>
  );
}

