'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

function LoginInner() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex h-screen items-center justify-center">
      {!sent ? (
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-black py-2 text-white hover:bg-slate-800"
            >
              Send Magic Link
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center text-slate-700">
          <p className="text-lg font-medium">Check your email</p>
          <p className="text-sm mt-2">
            A magic link has been sent to <strong>{email}</strong>.
          </p>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading...</main>}>
      <LoginInner />
    </Suspense>
  );
}

