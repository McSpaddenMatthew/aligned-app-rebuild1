'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuthFromHash() {
      // Strip the leading '#'
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;

      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      // 1) If the magic link sent tokens in the URL, turn them into a session
      if (access_token && refresh_token) {
        try {
          await supabase.auth.setSession({ access_token, refresh_token });

          // Clean the URL (remove the hash)
          window.history.replaceState({}, document.title, window.location.pathname);

          // Go straight to the dashboard
          router.replace('/dashboard');
          return;
        } catch (err) {
          console.error('Error setting Supabase session from hash', err);
          router.replace('/login');
          return;
        }
      }

      // 2) No hash: check if we already have a session
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }

    handleAuthFromHash();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="rounded-xl border border-gray-200 px-8 py-6 shadow-sm">
        <p className="text-sm text-gray-600">Checking your session…</p>
      </div>
    </main>
  );
}

