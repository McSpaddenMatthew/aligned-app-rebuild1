// pages/cases/[id].tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Inter } from "next/font/google";

// Premium font (no CSS edits needed)
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

// —— Types ——————————————————————————————————————————
type CaseRecord = {
  id: string;
  title: string | null;
  created_at: string | null;
  summary_markdown: string | null; // your generated candidate summary (Markdown)
};

// —— Helpers ——————————————————————————————————————————
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso ?? "";
  }
}

// —— Page ————————————————————————————————————————————
export default function CaseDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Adjust the table/column names if yours differ.
        const { data: row, error } = await supabase
          .from("cases")
          .select("id,title,created_at,summary_markdown")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!cancelled) setData(row as CaseRecord);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const pageTitle = useMemo(
    () => (data?.title ? `${data.title} – Candidate Summary` : "Candidate Summary"),
    [data?.title]
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`${inter.variable} min-h-screen bg-neutral-50`}>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">Aligned</div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-8">
          {loading && (
            <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="h-6 w-1/3 bg-neutral-200 rounded mb-4" />
              <div className="h-4 w-2/3 bg-neutral-200 rounded mb-1.5" />
              <div className="h-4 w-1/2 bg-neutral-200 rounded mb-1.5" />
              <div className="h-4 w-5/6 bg-neutral-200 rounded" />
            </div>
          )}

          {!loading && err && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {!loading && data && (
            <article className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  {data.title || "Untitled Case"}
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatDate(data.created_at)}
                </p>
              </div>

              {/* Markdown content */}
              <div
                className={`
                  prose prose-neutral max-w-none
                  prose-headings:font-semibold prose-h1:mb-3 prose-h2:mb-2
                  prose-p:text-neutral-800 prose-strong:text-neutral-900
                  prose-li:my-1 prose-ul:ml-5
                `}
                style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data.summary_markdown || "_No summary available._"}
                </ReactMarkdown>
              </div>
            </article>
          )}
        </main>
      </div>
    </>
  );
}
