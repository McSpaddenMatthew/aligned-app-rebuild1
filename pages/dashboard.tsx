// pages/dashboard.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

type CaseRow = Record<string, any>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Format date/time nicely
function fmtDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "medium" })
      .format(new Date(iso));
  } catch {
    return String(iso ?? "");
  }
}

// Try to pull a usable title/name from markdown when candidate_name is missing
function deriveTitleFromMarkdown(md: string) {
  if (!md) return "";
  // 1) First markdown heading like "# Jane Doe – Sr Director"
  const h = md.match(/^\s*#{1,3}\s+(.+)$/m)?.[1];
  if (h) return h.trim();

  // 2) A "Candidate:" label
  const lab = md.match(/candidate(?:\s*name)?\s*:\s*([^\n]+)/i)?.[1];
  if (lab) return lab.trim();

  // 3) First non-empty line — grab a "First Last" pattern
  const firstLine = (md.split(/\r?\n/).find(l => l.trim().length > 0) || "").trim();
  const nameMatch = firstLine.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/);
  if (nameMatch) return nameMatch[1];

  return "";
}

// Final display name used in the table
function displayName(row: CaseRow) {
  return (
    row.title ||
    row.candidate_name ||
    deriveTitleFromMarkdown(row.summary_markdown || row.summary || "") ||
    "Unknown"
  );
}

function getCreatedAt(row: CaseRow) {
  return row.created_at || row.createdAt || row.inserted_at || row.created || null;
}

export default function DashboardPage() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Prefer ordering by created_at if the column exists
        let data: CaseRow[] | null = null;
        try {
          const r = await supabase.from("cases").select("*").order("created_at", { ascending: false });
          if (r.error) throw r.error;
          data = r.data;
        } catch {
          const r2 = await supabase.from("cases").select("*");
          if (r2.error) throw r2.error;
          data = r2.data;
        }

        if (!cancelled) setRows(data || []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Head>
        <title>Aligned – Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`${inter.variable} min-h-screen bg-neutral-50`}>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">Aligned</div>
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition"
            >
              Log out
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Candidate Summaries</h1>
            <Link
              href="/new-summary"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-blue-700 transition"
            >
              ➕ Start New Summary
            </Link>
          </div>

          {loading && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-neutral-600">
              Loading…
            </div>
          )}

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && rows.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-neutral-600">
              No cases yet.
            </div>
          )}

          {!loading && !err && rows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-neutral-100 text-left text-sm text-neutral-700">
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Created</th>
                    <th className="px-4 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t text-sm">
                      <td className="px-4 py-2 text-neutral-900">{displayName(r)}</td>
                      <td className="px-4 py-2 text-neutral-600">{fmtDate(getCreatedAt(r))}</td>
                      <td className="px-4 py-2">
                        <Link href={`/cases/${r.id}`} className="text-blue-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
