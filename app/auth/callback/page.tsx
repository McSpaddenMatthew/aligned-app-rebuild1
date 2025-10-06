kk'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

    (async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            window.location.replace(
              `/login?error=exchange_failed&reason=${encodeURIComponent(error.message)}`
            );
            return;
          }
          window.location.replace(redirectTo);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) window.location.replace(redirectTo);
        else window.location.replace('/login?error=no_session');
      } catch (e: any) {
        window.location.replace(
          `/login?error=callback_crash&reason=${encodeURIComponent(e?.message || 'unknown')}`
        );
      }
    })();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-slate-700">Finishing sign-in…</p>
    </main>
  );
}

