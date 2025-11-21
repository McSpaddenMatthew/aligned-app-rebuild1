import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // Not logged in → back to /login
        router.replace('/login');
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-md border border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Welcome, {user?.email}
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          This is your unique Aligned dashboard. Everything you create here will be
          tied to your account.
        </p>

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium mb-1">Next up for MVP:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Create new candidate summaries.</li>
            <li>View and edit your existing summaries.</li>
            <li>Generate a shareable link for each hiring manager.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

