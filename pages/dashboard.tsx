// pages/dashboard.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getSupabaseServer } from "../lib/supabase-server"; // <- as in my earlier template

type Summary = { id: string; title: string | null; created_at: string };

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/list-summaries");
        if (res.status === 401) {
          // Not authenticated (cookie missing) — go to login
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`list-summaries ${res.status}: ${text || "Request failed"}`);
        }
        const data = (await res.json()) as { summaries?: Summary[] };
        if (mounted) setSummaries(Array.isArray(data?.summaries) ? data.summaries : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load summaries.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
        <Link href="/create" style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, textDecoration: "none" }}>
          + New Candidate Summary
        </Link>
      </header>

      {loading && <p>Loading…</p>}

      {error && (
        <div style={{ padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 10, marginBottom: 12 }}>
          <strong>Couldn’t load summaries.</strong>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.8 }}>{error}</div>
        </div>
      )}

      {!loading && !error && summaries.length === 0 && <p>No summaries yet. Create your first one above.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {summaries.map((s) => (
          <li key={s.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
            <Link href={`/summary/${s.id}`} style={{ textDecoration: "none" }}>
              <div style={{ fontWeight: 600 }}>{s.title ?? "Untitled summary"}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                {new Date(s.created_at).toLocaleString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

// 🔒 SSR guard: ONLY checks for a session; doesn’t fetch data.
// This avoids the “my email works / others don’t” loop when cookies aren’t set yet.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = getSupabaseServer(ctx);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};


import type { GetServerSideProps } from 'next';
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
