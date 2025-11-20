'use client';

import { FormEvent, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://aligned.vercel.app';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setMessage('Could not send magic link. Please try again.');
    } else {
      setMessage('Check your email for a magic sign-in link.');
    }

    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          padding: 24,
          border: '1px solid #ddd',
          borderRadius: 12,
          minWidth: 320,
          maxWidth: 420,
        }}
      >
        <h1 style={{ textAlign: 'center', marginTop: 0 }}>Login</h1>
        <p style={{ textAlign: 'center' }}>
          Enter your email to receive a magic link.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
              }}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #111827',
              background: '#111827',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Sending magic link…' : 'Send magic link'}
          </button>
        </form>
        {message && <p style={{ marginTop: 12, textAlign: 'center' }}>{message}</p>}
      </div>
    </main>
  );
}
