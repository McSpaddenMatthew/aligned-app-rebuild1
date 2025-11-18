// app/dashboard/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type ReportRow = {
  id: string;
  candidate_name: string;
  role?: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [resume, setResume] = useState('');
  const [recent, setRecent] = useState<ReportRow[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Guard: require auth (keeps your home→login→dashboard flow intact)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login?next=/dashboard');
      setSessionChecked(true);
    });
  }, [router]);

  // Load recent reports
  useEffect(() => {
    if (!sessionChecked) return;
    (async () => {
      const { data, error } = await supabase
        .from('candidate_summaries')
        .select('id,candidate_name,created_at,role')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error(error);
        setRecent([]);
      } else {
        setRecent(data as ReportRow[]);
      }
    })();
  }, [sessionChecked]);

  const disabled = useMemo(() => {
    return loading || candidateName.trim().length === 0 || notes.trim().length === 0;
  }, [loading, candidateName, notes]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/generateReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidateName.trim(),
          role: roleTitle.trim() || null,
          notes: notes.trim(),
          resume: resume.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Failed to generate report');

      // Navigate to the new report
      router.push(`/dashboard/${json.reportId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (!sessionChecked) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Top row: simple title + quiet context */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Make a decision-ready report in three quiet steps. No fluff—just the path.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: What to do (no hero, just crisp direction) */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-900 mb-3">Do this first</p>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[12px]">
                  1
                </span>
                Capture the hiring manager’s key priorities (paste notes).
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[12px]">
                  2
                </span>
                Add the candidate’s name and role (optional), plus resume text.
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[12px]">
                  3
                </span>
                Generate the summary. Your report appears on the right.
              </li>
            </ol>
          </div>
        </aside>

        {/* Middle: Minimal form (no big CTA, just obvious next action) */}
        <main className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="rounded-2xl border border-slate-200 p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-900">Candidate name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g., Jordan Lee"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900">
                Role (optional)
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., VP of Data Strategy"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900">
                Hiring manager notes (paste the words they used)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste the hiring manager’s priorities here…"
                rows={6}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">
                This is the lens. Aligned weighs everything against these priorities.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900">
                Candidate resume (optional paste)
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste resume text (or skip for now)…"
                rows={6}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </div>

            {errorMsg ? (
              <div className="text-sm text-red-600">{errorMsg}</div>
            ) : null}

            <div className="flex items-center justify-end">
              {/* Not a big hero CTA — just the obvious next action */}
              <button
                type="submit"
                disabled={disabled}
                className="rounded-xl px-4 py-2 border border-slate-900 disabled:opacity-40"
              >
                Generate summary
              </button>
            </div>
          </form>
        </main>

        {/* Right: Recent reports */}
        <section className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-900">Recent reports</p>
            </div>

            {!recent ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="text-sm text-slate-500">
                No reports yet. Generate your first summary and it will appear here.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {recent.map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {r.candidate_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.role ?? '—'} · {new Date(r.created_at).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/${r.id}`)}
                        className="text-xs underline"
                      >
                        Open
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

