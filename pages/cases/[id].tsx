import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type CaseRow = {
  id: string;
  job_title: string | null;
  job_description: string | null;
  hm_notes: string | null;
  recruiter_notes: string | null;
  summary_markdown: string | null;
  created_at: string;
};

type Packet = {
  candidateName?: string;
  candidateCall?: string;
  candidateResume?: string;
  hmConversation?: string;
  jobDescription?: string;
  otherIntel?: string;
  roleTitle?: string;
};

function parsePacket(raw: string | null): Packet {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed as Packet;
  } catch {
    return {};
  }
}

export default function CaseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<CaseRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const { data, error } = await supabase
        .from("summaries")
        .select("id, job_title, job_description, hm_notes, recruiter_notes, summary_markdown, created_at, user_id")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setCaseData(data as CaseRow);
      }
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return null;
  if (error || !caseData) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="card" style={{ maxWidth: 480 }}>
          <p>{error || "Case not found."}</p>
          <Link href="/dashboard" style={{ color: "var(--accent)" }}>
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const packet = parsePacket(caseData.recruiter_notes);

  return (
    <main style={{ padding: "48px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gap: 32 }}>
        <header style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="tag" style={{ marginBottom: 12 }}>Case file</p>
            <h1 style={{ margin: 0 }}>{packet.candidateName || "Candidate"}</h1>
            <p className="text-dim" style={{ marginTop: 4 }}>{caseData.job_title || packet.roleTitle || "Untitled role"}</p>
            <p className="text-dim" style={{ marginTop: 4 }}>{new Date(caseData.created_at).toLocaleString()}</p>
          </div>
          <Link href="/dashboard" style={{ color: "var(--accent)", fontWeight: 600 }}>
            ← Back to dashboard
          </Link>
        </header>

        <section className="card" style={{ display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0 }}>Operating partner brief</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              background: "rgba(0,0,0,0.2)",
              padding: 20,
              borderRadius: 20,
              border: "1px solid var(--border)",
            }}
          >
            {caseData.summary_markdown}
          </pre>
        </section>

        <section className="card" style={{ display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0 }}>Source material</h2>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <SourceBlock title="Candidate call" body={packet.candidateCall || "Not provided"} />
            <SourceBlock title="Resume highlights" body={packet.candidateResume || "Not provided"} />
            <SourceBlock title="Hiring manager conversation" body={packet.hmConversation || caseData.hm_notes || "Not provided"} />
            <SourceBlock title="Job description" body={packet.jobDescription || caseData.job_description || "Not provided"} />
            <SourceBlock title="Additional intel" body={packet.otherIntel || "Not provided"} />
          </div>
        </section>
      </div>
    </main>
  );
}

type SourceProps = { title: string; body: string };

function SourceBlock({ title, body }: SourceProps) {
  return (
    <div style={{ display: "grid", gap: 8, border: "1px solid var(--border)", borderRadius: 18, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
      <p className="text-dim" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{body}</p>
    </div>
  );
}
