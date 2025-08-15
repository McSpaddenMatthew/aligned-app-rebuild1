// pages/cases/[id].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import { createClient } from "@supabase/supabase-js";

type SummaryRow = {
  id: string;
  job_title: string | null;
  job_description: string | null;
  hm_notes: string | null;
  recruiter_notes: string | null;
  summary_markdown: string | null;
  created_at: string;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id as string;

  // Use service role on the server ONLY (safe inside getServerSideProps)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Case fetch error:", error);
    return { notFound: true };
  }

  return { props: { row: data } };
};

export default function CasePage({ row }: { row: SummaryRow }) {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "24px auto",
        padding: "0 16px",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <Head>
        <title>{row.job_title ? `${row.job_title} – Report` : "Report"}</title>
      </Head>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{row.job_title || "Report"}</h1>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {new Date(row.created_at).toLocaleString()}
          </div>
        </div>
        <a
          href="/dashboard"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            textDecoration: "none",
          }}
        >
          ← Back to Dashboard
        </a>
      </header>

      {/* AI Summary (Markdown) */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Candidate / Market Summary</h2>
        <div style={{ lineHeight: 1.6 }}>
          <ReactMarkdown>
            {row.summary_markdown || "No summary generated."}
          </ReactMarkdown>
        </div>
      </section>

      {/* Raw inputs for reference */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Job Description (raw)</h3>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {row.job_description}
        </pre>
      </section>

      {row.hm_notes ? (
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h3 style={{ marginTop: 0 }}>HM Notes</h3>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{row.hm_notes}</pre>
        </section>
      ) : null}

      {row.recruiter_notes ? (
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Recruiter Notes</h3>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {row.recruiter_notes}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
