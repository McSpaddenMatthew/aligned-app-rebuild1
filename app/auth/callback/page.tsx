'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';

      try {
        // Hash token flow: #access_token=…&refresh_token=…
        if (url.hash && url.hash.includes('access_token=')) {
          const hash = new URLSearchParams(url.hash.slice(1));
          const access_token = hash.get('access_token');
          const refresh_token = hash.get('refresh_token');

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            window.history.replaceState({}, '', `/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`);
            router.replace(redirectTo);
            return;
          }
        }

        // PKCE code flow: ?code=…
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace(redirectTo);
          return;
        }

        router.replace('/login?error=no_auth_params');
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/login?error=callback_failed');
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Finishing sign-in…</p>
    </div>
  );
}

