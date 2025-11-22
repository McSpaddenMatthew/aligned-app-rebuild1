"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type SupabaseUser = {
  id: string;
  email?: string;
};

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // no session -> back to login
        router.replace("/login");
        return;
      }

      setUser({ id: data.user.id, email: data.user.email ?? undefined });
      setLoading(false);
    };

    loadUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome to your Aligned dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Signed in as {user?.email ?? "unknown user"}
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Sign out
          </button>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-2 text-lg font-semibold">Your candidates</h2>
          <p className="text-sm text-slate-300">
            This is where we’ll show candidates, reports, and summaries for{" "}
            <span className="font-mono text-orange-400">
              user_id = {user?.id}
            </span>
            . Each recruiter sees only their own data.
          </p>
        </section>
      </div>
    </main>
  );
}
