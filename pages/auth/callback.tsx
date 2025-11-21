// pages/auth/callback.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Finishing sign-in…');

  useEffect(() => {
    async function finishSignIn() {
      // This will read the access token from the URL hash and store the session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        setMessage('Sign-in failed. Redirecting back to login…');
        setTimeout(() => router.replace('/login'), 1500);
        return;
      }

      if (data.session) {
        setMessage('Signed in. Loading your dashboard…');
        setTimeout(() => router.replace('/dashboard'), 800);
      } else {
        setMessage('No active session. Redirecting back to login…');
        setTimeout(() => router.replace('/login'), 1500);
      }
    }

    finishSignIn();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="mb-2 text-center text-xl font-semibold">Signing you in…</h1>
        <p className="text-center text-sm text-slate-500">{message}</p>
      </div>
    </main>
  );
}
