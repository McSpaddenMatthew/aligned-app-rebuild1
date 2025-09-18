// pages/cases/[id].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Inter, Merriweather } from "next/font/google";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GetServerSideProps } from "next"; // ⬅️ added

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const merri = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  variable: "--font-merri",
});

type CaseRow = {
  id: string;
  user_id?: string | null;
  candidate_name?: string | null;
  role?: string | null;
  summary_markdown?: string | null;
  created_at?: string | null;
  [k: string]: any;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// ---------- helpers ----------
function fmtDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso)
    );
  } catch {
    return String(iso ?? "");
  }
}

function deriveTitleFromMarkdown(md?: string | null) {
  if (!md) return "";
  const h = md.match(/^\s*#{1,3}\s+(.+)$/m)?.[1];
  if (h) return h.trim();
  const lab = md.match(/candidate(?:\s*name)?\s*:\s*([^\n]+)/i)?.[1];
  if (lab) return lab.trim();
  const first = (md.split(/\r?\n/).find((l) => l.trim()) || "").trim();
  const nameMatch = first.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/);
  return (nameMatch && nameMatch[1]) || "";
}

function markdownToText(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ""))
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------- page ----------
export default function CaseDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState<CaseRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<"md" | "txt" | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data, error } = await supabase.from("cases").select("*").eq("id", id).single();
        if (error) throw error;
        if (!cancelled) setRow(data as CaseRow);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Unable to load case.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const title = useMemo(() => {
    const md = row?.summary_markdown || "";
    return row?.candidate_name || deriveTitleFromMarkdown(md) || "Aligned";
  }, [row]);

  async function copyMarkdown() {
    const md = row?.summary_markdown || "";
    await navigator.clipboard.writeText(md);
    setCopied("md");
    setTimeout(() => setCopied(null), 1500);
  }

  async function copyText() {
    const md = row?.summary_markdown || "";
    const txt = markdownToText(md);
    await navigator.clipboard.writeText(txt);
    setCopied("txt");
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <Head>
        <title>{title} – Aligned</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`${inter.variable} ${merri.variable} min-h-screen bg-neutral-50`}>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900">
              ← Back to Dashboard
            </Link>
            <div className="text-sm text-neutral-500">{row?.created_at && fmtDate(row.created_at)}</div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {title}
              {row?.role ? <span className="text-neutral-500 font-normal"> — {row.role}</span> : null}
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                title="Copy as plain text (email friendly)"
              >
                {copied === "txt" ? "✔ Copied Text" : "Copy as Text"}
              </button>
              <button
                onClick={copyMarkdown}
                className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800"
                title="Copy original Markdown"
              >
                {copied === "md" ? "✔ Copied Markdown" : "Copy as Markdown"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-neutral-600">
              Loading…
            </div>
          )}

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && !row && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              No case found for this ID.
            </div>
          )}

          {!loading && !err && row && (
            <article
              className="prose prose-neutral max-w-none rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              style={{ lineHeight: 1.5 }}
            >
              <div className="not-prose mb-4">
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  Candidate / Market Summary
                </div>
              </div>

              <div className="font-serif text-[1.05rem] leading-7">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {row.summary_markdown || ""}
                </ReactMarkdown>
              </div>
            </article>
          )}
        </main>
      </div>
    </>
  );
}

// ⬇️ Force SSR so Next.js doesn't try to pre-render this dynamic route at build time.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

