'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error('Auth callback error:', error);
        router.replace('/login?error=callback_failed');
      } else {
        const redirectTo = searchParams.get('redirectTo') || '/dashboard';
        router.replace(redirectTo);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Finishing sign-in...</p>
    </div>
  );
}

