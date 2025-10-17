'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Summary = {
  id: string;
  title: string;
  updated_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      // TODO: replace with your real fetch (Supabase/RLS)
      // Placeholder sample data for the clean UI
      setSummaries([
        { id: '1', title: 'VP Data Strategy — P3 Health', updated_at: '2025-10-16T13:00:00Z' },
        { id: '2', title: 'CFO — Portfolio FinTech', updated_at: '2025-10-12T09:30:00Z' },
        { id: '3', title: 'Head of RevOps — Healthcare', updated_at: '2025-10-09T17:15:00Z' },
      ]);

      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return <div className="p-8">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A0A0A]">
      {/* top bar */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-extrabold tracking-tight">Aligned</div>
          <div className="flex items-center gap-3">
            <Link
              href="/summaries/new"
              className="rounded-md px-4 py-2 font-semibold bg-[#FF6B35] text-white hover:opacity-90 transition"
            >
              + New Report
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* headline */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Reports at a glance</h1>
          <p className="text-[#475569] mt-1">
            Evidence-backed summaries your operating partners can trust.
          </p>
        </div>

        {/* quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Active searches" value="3" />
          <StatCard label="Reports this week" value="7" />
          <StatCard label="Avg time to decision" value="2.1 days" />
        </div>

        {/* recent reports */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent reports</h2>
            <Link
              href="/summaries"
              className="text-sm text-[#475569] hover:text-[#0A0A0A] transition"
            >
              View all →
            </Link>
          </div>

          {summaries.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-[#F1F5F9]">
              {summaries.map((s) => (
                <li key={s.id} className="py-4 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/summaries/${s.id}`}
                      className="font-medium hover:underline underline-offset-4"
                    >
                      {s.title}
                    </Link>
                    <div className="text-sm text-[#475569]">
                      Updated {new Date(s.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/summaries/${s.id}`}
                      className="text-sm rounded-md px-3 py-2 border border-[#E2E8F0] hover:bg-[#F1F5F9] transition"
                    >
                      Open
                    </Link>
                    <Link
                      href={`/summaries/${s.id}/share`}
                      className="text-sm rounded-md px-3 py-2 border border-[#E2E8F0] hover:bg-[#F1F5F9] transition"
                    >
                      Share
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

/* ========== UI bits ========== */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
      <div className="text-sm text-[#475569]">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] p-10 text-center">
      <div className="text-lg font-semibold">No reports yet</div>
      <p className="text-[#475569] mt-1">Create your first decision-ready report.</p>
      <div className="mt-4">
        <Link
          href="/summaries/new"
          className="rounded-md px-4 py-2 font-semibold bg-[#FF6B35] text-white hover:opacity-90 transition"
        >
          + New Report
        </Link>
      </div>
    </div>
  );
}
