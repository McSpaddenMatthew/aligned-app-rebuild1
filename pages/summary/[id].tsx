// pages/summary/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";

type SummaryRow = {
  id: string;
  title: string | null;
  summary: string | null;
  created_at: string | null;
};

function sanitize(html: string) {
  // very small sanitizer for our own model output
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

/**
 * Wrap [hh:mm:ss] or [mm:ss] (and (hh:mm:ss)/(mm:ss)) timecodes in a styled span.
 * We run this after markdown → HTML so we don't fight the markdown parser.
 */
function highlightTimecodes(html: string) {
  // square brackets: [00:12:34] or [12:34]
  html = html.replace(
    /\[(?:\d{1,2}:)?\d{1,2}:\d{2}\]/g,
    (m) => `<span class="tc">${m}</span>`
  );
  // parentheses timecodes: (00:12:34) or (12:34)
  html = html.replace(
    /\((?:\d{1,2}:)?\d{1,2}:\d{2}\)/g,
    (m) => `<span class="tc">${m}</span>`
  );
  return html;
}

export default function SummaryPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<SummaryRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/get-summary?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { summary: SummaryRow | null };
        if (mounted) setRow(data?.summary ?? null);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load summary.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const created =
    row?.created_at ? new Date(row.created_at).toLocaleString() : "";

  const html = useMemo(() => {
    const md = row?.summary?.trim() ?? "";
    if (!md) return "";
    const rendered = marked.parse(md) as string;
    return highlightTimecodes(sanitize(rendered));
  }, [row?.summary]);

  return (
    <main className="page">
      <header className="header">
        <div className="title">{row?.title ?? "Untitled summary"}</div>
        {created && <div className="meta">{created}</div>}
      </header>

      {loading && <p>Loading…</p>}
      {error && <p className="err">Error: {error}</p>}
      {!loading && !error && !row && <p>Not found.</p>}

      {!loading && !error && row && (
        <article
          className="card content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      <nav className="actions">
        <a className="btn" href="/dashboard">
          ← Back to Dashboard
        </a>
        <a className="btn" href="/create">
          + New Candidate Summary
        </a>
      </nav>

      {/* Minimal, component-scoped styles for a clean, modern feel */}
      <style jsx>{`
        .page {
          max-width: 980px;
          margin: 40px auto;
          padding: 24px;
        }
        .header {
          margin-bottom: 14px;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .meta {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 4px;
        }
        .err {
          color: #b91c1c;
        }
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          padding: 20px;
        }
        .content :global(h1),
        .content :global(h2),
        .content :global(h3) {
          margin-top: 18px;
          margin-bottom: 10px;
          line-height: 1.25;
        }
        .content :global(h2) {
          font-size: 20px;
          font-weight: 700;
        }
        .content :global(h3) {
          font-size: 16px;
          font-weight: 700;
        }
        .content :global(p) {
          margin: 8px 0 12px;
          line-height: 1.7;
        }
        .content :global(ul),
        .content :global(ol) {
          margin: 6px 0 14px 0;
          padding-left: 22px;
        }
        .content :global(li) {
          margin: 6px 0;
        }
        .content :global(hr) {
          border: none;
          border-top: 1px solid #eee;
          margin: 16px 0;
        }
        /* timecode */
        :global(.tc) {
          color: #6b7280; /* gray-500 */
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: 0.85em;
          margin-left: 4px;
        }
        .actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .btn {
          display: inline-block;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .btn:hover {
          background: #fafafa;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </main>
  );
}

import type { GetServerSideProps } from 'next';
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
