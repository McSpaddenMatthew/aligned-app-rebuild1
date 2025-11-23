"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

type User = {
  email: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser({ email: session.user.email });
      setLoading(false);
    };

    void init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Aligned</title>
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top bar */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-black" />
              <span className="text-sm font-semibold tracking-tight">Aligned</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              {user?.email && <span className="text-slate-500">{user.email}</span>}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hiring manager summaries</h1>
            <p className="mt-1 text-sm text-slate-500">
              Start by creating a new candidate summary based on your latest hiring manager intake call.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => router.push("/summary/new")}
              className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-[11px] font-medium text-white mb-2">
                First action
              </span>
              <span className="text-sm font-semibold">Build a new Aligned summary</span>
              <span className="mt-1 text-xs text-slate-500">
                Upload notes or call transcript and we&apos;ll turn it into a decision-ready report.
              </span>
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Pipeline snapshot</div>
              <p className="text-sm text-slate-600">
                This area will show your open roles, candidates in review, and summaries shared with hiring managers.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
