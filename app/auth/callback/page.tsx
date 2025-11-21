'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const handleAuth = async () => {
      // This reads the access_token / refresh_token from the URL
      // (works for both ?code= and #access_token magic-link URLs)
      const { error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error) {
        console.error('Auth callback error:', error.message);
        setError(error.message);
        return;
      }

      // Signed in → go to dashboard
      router.replace('/dashboard');
    };

    handleAuth();
  }, [router]);

  if (error) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <div>
          <h1>Sign-in error</h1>
          <p>{error}</p>
          <p>Please close this tab and try logging in again.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div>
        <h1>Signing you in…</h1>
        <p>You can close this tab if nothing happens.</p>
      </div>
    </main>
  );
}
