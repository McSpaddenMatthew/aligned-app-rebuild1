// pages/dashboard.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

type AnyRow = Record<string, any>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

function getTitle(row: AnyRow) {
  return row.title || row.name || row.case_name || row.label || row.candidate_name || "Untitled Case";
}
function getWhen(row: AnyRow) {
  const v = row.created_at || row.createdAt || row.inserted_at || row.created || null;
  if (!v) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
      .format(new Date(v));
  } catch { return String(v); }
}

export default function Dashboard() {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Prefer ordering by created_at if present; fall back to plain select.
        let data: AnyRow[] | null = null;
        try {
          const r = await supabase.from("cases").select("*").order("created_at", { ascending: false });
          if (r.error) throw r.error;
          data = r.data;
        } catch {
          const r2 = await supabase.from("cases").select("*");
          if (r2.error) throw r2.error;
          data = r2.data;
        }

        const cleaned = (data || []).filter((r) => !!r.id); // require primary key `id`
        if (!cancelled) setRows(cleaned);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load cases");
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
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">Aligned</div>
            <div className="text-sm text-neutral-500">Dashboard</div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-4">
            Recent Reports
          </h1>

          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-16 rounded-xl border border-neutral-200 bg-white" />
              ))}
            </div>
          )}

          {!loading && err && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && rows.length === 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
              No reports yet.
            </div>
          )}

          {!loading && !err && rows.length > 0 && (
            <ul className="space-y-3">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/cases/${row.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-neutral-900">{getTitle(row)}</div>
                      <div className="text-xs text-neutral-500">{getWhen(row)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </>
  );
}
