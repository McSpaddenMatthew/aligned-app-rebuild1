'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
      setMsg('✅ Magic link sent. Check your inbox.');
    } catch (err: any) {
      setMsg(err?.message ?? 'Failed to send magic link.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-[380px] rounded-2xl shadow p-8 border">
        <h1 className="text-2xl font-semibold text-center mb-6">Sign in</h1>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 mb-4"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl px-4 py-3 bg-black text-white disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send Magic Link'}
        </button>
        {msg && <p className="mt-4 text-center text-sm">{msg}</p>}
      </form>
    </div>
  );
}


