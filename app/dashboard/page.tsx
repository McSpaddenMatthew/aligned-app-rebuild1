"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white shadow-md border border-slate-200 px-8 py-10 text-center">
          <p className="text-sm text-slate-700">Loading your dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-md border border-slate-200 px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Welcome to Aligned
        </h1>
        <p className="text-sm text-slate-700 mb-6">
          Signed in as <span className="font-mono">{user?.email}</span>
        </p>

        <button
          onClick={handleSignOut}
          className="text-sm rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
