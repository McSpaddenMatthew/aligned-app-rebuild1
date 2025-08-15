import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Summary = {
  id: string;
  job_title: string | null;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionOk, setSessionOk] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hmNotes, setHmNotes] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }
      setSessionOk(true);
      setLoading(false);
      await loadSummaries();
    });
  }, [router]);

  async function loadSummaries() {
    const { data, error } = await supabase
      .from("summaries")
      .select("id, job_title, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && data) setSummaries(data as Summary[]);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle || !jobDescription) {
      alert("Please include at least Job Title and Job Description.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          hmNotes,
          recruiterNotes,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const { id } = await res.json();
      // Refresh list and open the new record
      await loadSummaries();
      router.push(`/cases/${id}`);
    } catch (err: any) {
      alert(err.message || "Error generating summary");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return null;
  if (!sessionOk) return null;

  return (
    <main style={{maxWidth:1000, margin:"24px auto", padding:"0 16px", fontFamily:"ui-sans-serif,system-ui"}}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
        <h1 style={{margin:0}}>Recruiter Dashboard</h1>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
          style={{padding:"8px 12px", borderRadius:10, border:"1px solid #e5e7eb", background:"white", cursor:"pointer"}}
        >
          Log out
        </button>
      </header>

      <section style={{display:"grid", gap:12, border:"1px solid #e5e7eb", borderRadius:16, padding:16, marginBottom:24}}>
        <h2 style={{margin:"0 0 8px"}}>Create a Hiring Manager–Ready Report</h2>
        <form onSubmit={handleGenerate} style={{display:"grid", gap:12}}>
          <div>
            <label style={{display:"block", fontWeight:600}}>Job Title</label>
            <input
              value={jobTitle}
              onChange={(e)=>setJobTitle(e.target.value)}
              placeholder="Senior Director of Data Strategy"
              style={{width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb"}}
            />
          </div>
          <div>
            <label style={{display:"block", fontWeight:600}}>Job Description / Requirements</label>
            <textarea
              value={jobDescription}
              onChange={(e)=>setJobDescription(e.target.value)}
              rows={6}
              placeholder="Paste the JD or key requirements here…"
              style={{width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb"}}
            />
          </div>
          <div>
            <label style={{display:"block", fontWeight:600}}>HM Conversation Notes (optional)</label>
            <textarea
              value={hmNotes}
              onChange={(e)=>setHmNotes(e.target.value)}
              rows={4}
              placeholder="Paste transcript snippets or bullet notes from your HM call…"
              style={{width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb"}}
            />
          </div>
          <div>
            <label style={{display:"block", fontWeight:600}}>Recruiter Notes (optional)</label>
            <textarea
              value={recruiterNotes}
              onChange={(e)=>setRecruiterNotes(e.target.value)}
              rows={4}
              placeholder="Anything else: market context, constraints, nice-to-haves, etc."
              style={{width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb"}}
            />
          </div>
          <button
            type="submit"
            disabled={generating}
            style={{padding:"10px 14px", borderRadius:12, border:"1px solid #111827", background:"#111827", color:"white", cursor:"pointer"}}
          >
            {generating ? "Generating…" : "Generate Report"}
          </button>
        </form>
      </section>

      <section style={{border:"1px solid #e5e7eb", borderRadius:16, padding:16}}>
        <h2 style={{margin:"0 0 8px"}}>Recent Reports</h2>
        <div style={{display:"grid", gap:8}}>
          {summaries.length === 0 ? (
            <p>No reports yet.</p>
          ) : summaries.map((s) => (
            <a key={s.id} href={`/cases/${s.id}`} style={{padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:12, textDecoration:"none"}}>
              <div style={{fontWeight:600}}>{s.job_title || "Untitled role"}</div>
              <div style={{fontSize:12, opacity:.7}}>{new Date(s.created_at).toLocaleString()}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}


