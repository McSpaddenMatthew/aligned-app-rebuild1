'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly — no missing alias imports
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Case 1: PKCE flow (?code=)
        const code = search.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession({ code });
        } else if (
          typeof window !== 'undefined' &&
          window.location.hash.includes('access_token')
        ) {
          // Case 2: implicit flow (#access_token=...)
          const params = new URLSearchParams(window.location.hash.slice(1));
          const access_token = params.get('access_token') ?? undefined;
          const refresh_token = params.get('refresh_token') ?? undefined;
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      } finally {
        router.replace('/dashboard');
      }
    };

    handleAuthCallback();
  }, [router, search]);

  return (
    <div className="flex h-screen items-center justify-center text-lg">
      Signing you in...
    </div>
  );
}
