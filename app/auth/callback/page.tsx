'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const url = new URL(window.location.href);
      const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

      try {
        // ---- Hash-token (non-PKCE) magic link ----
        if (window.location.hash && window.location.hash.includes('access_token=')) {
          const hash = window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash;
          const h = new URLSearchParams(hash);
          const access_token = h.get('access_token');
          const refresh_token = h.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            router.replace(redirectTo);
            return;
          }
        }

        // ---- PKCE code flow ----
        if (url.searchParams.get('code')) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
          router.replace(redirectTo);
          return;
        }

        // Nothing usable – go back to login
        router.replace('/login?error=no_auth_params');
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/login?error=callback_failed');
      }
    };

    run();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Finishing sign-in…</p>
    </div>
  );
}
