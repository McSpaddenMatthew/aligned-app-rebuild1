// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

interface UserState {
  email: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'redirecting'>('loading');

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setStatus('redirecting');
        router.replace('/login');
        return;
      }

      setUser({ email: data.user.email ?? null });
      setStatus('ready');
    }

    loadUser();
  }, [router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking your session…</p>
      </main>
    );
  }

  if (status === 'redirecting') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Redirecting to login…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div>
          <h1 className="text-xl font-semibold">Aligned dashboard</h1>
          <p className="text-xs text-slate-500">
            Signed in as <span className="font-mono">{user?.email}</span>
          </p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          }}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Log out
        </button>
      </header>

      <section className="px-8 py-10">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8">
          <h2 className="mb-2 text-lg font-semibold">Your reports</h2>
          <p className="text-sm text-slate-500">
            This is your unique dashboard. Next step will be listing your candidate summaries here.
          </p>
        </div>
      </section>
    </main>
  );
}
