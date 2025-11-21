'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handles BOTH:
        //   - ?code=... URLs
        //   - #access_token=... magic-link URLs
        const url = window.location.href;

        const { error } = await supabase.auth.exchangeCodeForSession(url);

        if (error) {
          console.error('Error exchanging code for session:', error);
          router.replace('/login?error=callback');
          return;
        }

        // Successful login – send user to dashboard
        router.replace('/dashboard');
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        router.replace('/login?error=callback');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          padding: '2rem 3rem',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Finishing sign-in…</h1>
        <p style={{ color: '#64748b' }}>Please wait while we verify your magic link.</p>
      </div>
    </main>
  );
}
