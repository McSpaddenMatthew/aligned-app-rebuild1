import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Finishing sign-in…');

  useEffect(() => {
    const run = async () => {
      // 1. Read the fragment or query params from the magic link
      const url = new URL(window.location.href);

      // Supabase sends a `code` param when you use emailRedirectTo
      const code = url.searchParams.get('code');

      if (!code) {
        setMessage('No auth code found. Try requesting a new magic link.');
        return;
      }

      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(error);
        setMessage('Could not complete sign-in. Try again.');
        return;
      }

      // 2. On success → redirect to dashboard
      router.replace('/dashboard');
    };

    run();
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div>
        <h1>Signing you in…</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}
