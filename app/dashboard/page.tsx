'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login?next=/dashboard');
      } else {
        setEmail(session.user.email);
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 text-gray-900">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition"
        >
          Sign Out
        </button>
      </div>

      <p className="text-gray-700">
        You’re signed in as <strong>{email}</strong>.
      </p>

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-2">Welcome to Aligned</h2>
        <p className="text-gray-600">
          Your secure recruiter workspace. From here, you’ll manage candidate summaries,
          reports, and updates for your hiring managers.
        </p>
      </div>
    </div>
  );
}
