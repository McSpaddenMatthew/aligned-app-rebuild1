'use client';
export const dynamic = 'force-dynamic'; // don't prerender this page

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Exchange the code fragment/params for a session
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        // Read optional redirect target (fallback to /dashboard)
        const url = new URL(window.location.href);
        const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
        router.replace(redirectTo);
      } catch (e) {
        console.error('Auth callback error:', e);
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

