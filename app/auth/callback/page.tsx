'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // exchange the code in the URL for a session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error('Auth callback error:', error);
        router.replace('/login?error=callback_failed');
        return;
      }

      // optional: honor ?redirectTo=... if present
      const url = new URL(window.location.href);
      const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';
      router.replace(redirectTo);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Finishing sign-in…</p>
    </div>
  );
}

