// pages/history.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getSupabaseServer } from "../lib/supabase-server";

type Summary = {
  id: string;
  title: string | null;
  created_at: string;
};

export default function History() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Summary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/list-summaries", { method: "GET" });
        if (res.status === 401) {
          // No session cookie on the client — bounce to login
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`list-summaries ${res.status}: ${text || "Request failed"}`);
        }
        const data = (await res.json()) as { summaries?: Summary[] };
        if (mounted) setItems(Array.isArray(data?.summaries) ? data.summaries : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load history.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>History</h1>
        <nav style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
          <Link
            href="/create"
            style={{
              padding: "10px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            + New Candidate Summary
          </Link>
        </nav>
      </header>

      {loading && <p>Loading…</p>}

      {error && (
        <div
          style={{
            padding: 12,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <strong>Couldn’t load history.</strong>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}>{error}</div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p>No past summaries yet. Create your first one from the dashboard.</p>
      )}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 12,
        }}
      >
        {items.map((s) => (
          <li
            key={s.id}
            style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}
          >
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

// 🔒 SSR auth guard so this page never prerenders without a session.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = getSupabaseServer(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

