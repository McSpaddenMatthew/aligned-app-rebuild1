'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function Fallback() {
  return (
    <div className="flex h-screen items-center justify-center text-lg">
      Signing you in…
    </div>
  );
}

function CallbackInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const handle = async () => {
      try {
        const code = search.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession({ code });
        } else if (
          typeof window !== 'undefined' &&
          window.location.hash.includes('access_token')
        ) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const access_token = params.get('access_token') ?? undefined;
          const refresh_token = params.get('refresh_token') ?? undefined;
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      } catch (e) {
        console.error('Auth callback error:', e);
      } finally {
        router.replace('/dashboard');
      }
    };
    handle();
  }, [router, search]);

  return <Fallback />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CallbackInner />
    </Suspense>
  );
}
