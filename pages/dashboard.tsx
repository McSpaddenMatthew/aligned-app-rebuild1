import { FormEvent, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type SummaryRow = {
  id: string;
  job_title: string | null;
  recruiter_notes: string | null;
  created_at: string;
  summary_markdown: string | null;
};

type InputPacket = {
  candidateName: string;
  candidateResume: string;
  candidateCall: string;
  hmConversation: string;
  jobDescription: string;
  otherIntel: string;
  roleTitle: string;
};

function parseInputs(raw: string | null): Partial<InputPacket> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed) return parsed as Partial<InputPacket>;
    return {};
  } catch {
    return {};
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [roleTitle, setRoleTitle] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateCall, setCandidateCall] = useState("");
  const [candidateResume, setCandidateResume] = useState("");
  const [hmConversation, setHmConversation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [otherIntel, setOtherIntel] = useState("");
  const [generating, setGenerating] = useState(false);

  const [summaries, setSummaries] = useState<SummaryRow[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }
      setUserId(session.user.id);
      setLoading(false);
      await loadSummaries(session.user.id);
    });
  }, [router]);

  async function loadSummaries(uid?: string) {
    const target = uid || userId;
    if (!target) return;
    const { data, error } = await supabase
      .from("summaries")
      .select("id, job_title, recruiter_notes, summary_markdown, created_at")
      .eq("user_id", target)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setSummaries(data as SummaryRow[]);
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!candidateName.trim() || !roleTitle.trim() || !jobDescription.trim()) {
      alert("Candidate name, role title, and job description are required.");
      return;
    }
    setGenerating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          candidateName,
          roleTitle,
          candidateCall,
          candidateResume,
          hmConversation,
          jobDescription,
          otherIntel,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to generate summary");
      await loadSummaries();
      router.push(`/cases/${payload.id}`);
    } catch (err: any) {
      alert(err?.message || "Unable to generate summary");
    } finally {
      setGenerating(false);
    }
  }

  const fieldStyle: CSSProperties = {
    width: "100%",
    borderRadius: 14,
    border: "1px solid var(--border)",
    background: "rgba(0,0,0,0.2)",
    color: "var(--text)",
    padding: "12px 14px",
  };

  if (loading) return null;

  return (
    <main style={{ padding: "48px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gap: 32 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="tag" style={{ marginBottom: 12 }}>Private workspace</p>
            <h1 style={{ margin: 0 }}>Recruiter → Operating Partner Command Center</h1>
            <p className="text-dim" style={{ marginTop: 8 }}>Every entry below is private to {""}
              {userId?.slice(0, 4)}…</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            style={{
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </header>

        <section className="card" style={{ display: "grid", gap: 24 }}>
          <div>
            <p className="tag">Create a trust brief</p>
            <h2 style={{ margin: "8px 0 0" }}>Capture every signal about this candidate</h2>
            <p className="text-dim">Aligned reframes your sources with StoryBrand clarity so your operating partner knows exactly why this hire matters.</p>
          </div>
          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Role title / mandate</span>
                <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Operating Partner, GTM" style={fieldStyle} />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <span>Candidate name</span>
                <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Jordan Patel" style={fieldStyle} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Candidate call transcript / notes</span>
              <textarea value={candidateCall} onChange={(e) => setCandidateCall(e.target.value)} rows={4} placeholder="Paste your Zoom transcript or bullet notes" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Candidate resume</span>
              <textarea value={candidateResume} onChange={(e) => setCandidateResume(e.target.value)} rows={4} placeholder="Paste relevant resume highlights or attach raw text" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Hiring manager conversation</span>
              <textarea value={hmConversation} onChange={(e) => setHmConversation(e.target.value)} rows={4} placeholder="Transcript, risks, value creation asks" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Job description / success metrics</span>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} placeholder="Paste the JD or KPI targets" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <span>Other intel (board notes, deal context, constraints)</span>
              <textarea value={otherIntel} onChange={(e) => setOtherIntel(e.target.value)} rows={4} placeholder="Anything else the operating partner should know" style={fieldStyle} />
            </label>
            <button
              type="submit"
              disabled={generating}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "14px 32px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.08,
                background: generating ? "rgba(255,255,255,0.1)" : "var(--accent-strong)",
                color: generating ? "var(--text-dim)" : "#041013",
                cursor: "pointer",
              }}
            >
              {generating ? "Generating summary…" : "Generate summary"}
            </button>
          </form>
        </section>

        <section className="card" style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Your candidates</h2>
            <p className="text-dim" style={{ margin: 0 }}>Only you can see these entries. Each summary lives under your Supabase user id.</p>
          </div>
          {summaries.length === 0 ? (
            <p className="text-dim" style={{ margin: 0 }}>No candidates yet. Capture your first transcript above.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {summaries.map((summary) => {
                const inputs = parseInputs(summary.recruiter_notes);
                const candidateLabel = inputs.candidateName || "Unnamed candidate";
                return (
                  <a
                    key={summary.id}
                    href={`/cases/${summary.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "16px 20px",
                      borderRadius: 18,
                      border: "1px solid var(--border)",
                      textDecoration: "none",
                      color: "inherit",
                      background: "rgba(6,8,18,0.6)",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{candidateLabel}</p>
                      <p className="text-dim" style={{ margin: 0 }}>{summary.job_title || inputs.roleTitle || "Untitled role"}</p>
                    </div>
                    <p className="text-dim" style={{ margin: 0, fontSize: "0.9rem" }}>
                      {new Date(summary.created_at).toLocaleString()}
                    </p>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
