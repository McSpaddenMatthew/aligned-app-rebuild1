// pages/cases/[id].tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

type AnyRow = Record<string, any>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
      .format(new Date(iso));
  } catch {
    return iso || "";
  }
}

function getTitle(row: AnyRow, fallbackId: string) {
  return (
    row.title ||
    row.name ||
    row.case_name ||
    row.label ||
    `Case ${fallbackId}`
  );
}

function getCreatedAt(row: AnyRow) {
  return row.created_at || row.createdAt || row.inserted_at || row.created || null;
}

function getMarkdown(row: AnyRow) {
  return (
    row.summary_markdown ||
    row.summary ||
    row.generated_markdown ||
    row.report ||
    row.output ||
    row.content ||
    ""
  );
}

export default function CaseDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [row, setRow] = useState<AnyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Select everything to avoid missing-column errors
        const { data, error } = await supabase
          .from("cases")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!cancelled) setRow(data as AnyRow);
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

  const pageTitle = useMemo(() => getTitle(row || {}, id || ""), [row, id]);

  return (
    <>
      <Head>
        <title>{row ? `${pageTitle} – Candidate Summary` : "Candidate Summary"}</title>
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

          {!loading && row && (
            <article className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  {getTitle(row, id || "")}
                </h1>
                <p className="mt-1 text-sm text-neutral-500">{formatDate(getCreatedAt(row))}</p>
              </div>

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
                  {getMarkdown(row) || "_No summary available._"}
                </ReactMarkdown>
              </div>
            </article>
          )}
        </main>
      </div>
    </>
  );
}
