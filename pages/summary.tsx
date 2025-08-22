import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Inputs = {
  candidateName?: string;
  candidateTitle?: string;
  location?: string;
  industryFit?: string;
  jobDescription?: string;
  recruiterNotes?: string;
  hmTranscript?: string;
  candidateResume?: string;
  candidateCall?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const hasSupabase = !!supabaseUrl && !!supabaseAnon;

function mapRecordToInputs(rec: any): Inputs {
  if (!rec) return {};
  const pick = (...keys: string[]) => {
    for (const k of keys) if (rec[k] != null && String(rec[k]).trim() !== "") return String(rec[k]);
    return "";
  };
  return {
    candidateName:   pick("candidateName","name","candidate_name","candidate"),
    candidateTitle:  pick("candidateTitle","title","role","candidate_title"),
    location:        pick("location","city_state","city","loc"),
    industryFit:     pick("industryFit","industry_fit","industry","domain"),
    jobDescription:  pick("jobDescription","job_description","jd","role_requirements"),
    recruiterNotes:  pick("recruiterNotes","recruiter_notes","notes"),
    hmTranscript:    pick("hmTranscript","hiring_manager_transcript","hm_notes","manager_transcript"),
    candidateResume: pick("candidateResume","resume","cv","candidate_resume"),
    candidateCall:   pick("candidateCall","candidate_call","call_transcript","screen_transcript"),
  };
}

export default function SummaryPage() {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [inputs, setInputs] = useState<Inputs>({});
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const id = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    return url.searchParams.get("id") || "";
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Load the record (Supabase → "summaries" then "cases")
        let rec: any = null;
        if (hasSupabase && id) {
          const supabase = createClient(supabaseUrl, supabaseAnon);

          // try summaries
          let { data, error } = await supabase.from("summaries").select("*").eq("id", id).maybeSingle();
          if (error && error.code !== "PGRST116") throw error; // real error
          if (data) rec = data;

          // fallback: cases
          if (!rec) {
            const { data: data2, error: err2 } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
            if (err2 && err2.code !== "PGRST116") throw err2;
            if (data2) rec = data2;
          }
        }

        // 2) Map to generator inputs
        const mapped = mapRecordToInputs(rec || {});
        // keep something visible even if name/title missing
        if (!mapped.candidateName) mapped.candidateName = "Candidate";
        setRecord(rec);
        setInputs(mapped);

        // 3) Call our generator
        const resp = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mapped),
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || "Generation failed");
        setReport(json.generated || "");
      } catch (e: any) {
        console.error(e);
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function regenerate() {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || "Generation failed");
      setReport(json.generated || "");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(report);
    alert("Copied (Markdown). Paste into your email and tweak freely.");
  }

  function mdToHtml(md: string) {
    const r: [RegExp, string][] = [
      [/^###### (.*$)/gim, "<h6>$1</h6>"],
      [/^##### (.*$)/gim, "<h5>$1</h5>"],
      [/^#### (.*$)/gim, "<h4>$1</h4>"],
      [/^### (.*$)/gim, "<h3>$1</h3>"],
      [/^## (.*$)/gim, "<h2>$1</h2>"],
      [/^# (.*$)/gim, "<h1>$1</h1>"],
      [/\*\*(.*?)\*\*/gim, "<strong>$1</strong>"],
      [/\*(.*?)\*/gim, "<em>$1</em>"],
      [/`([^`]+)`/gim, "<code>$1</code>"],
      [/\n$/gim, "<br/>"],
    ];
    let html = md;
    r.forEach(([re, t]) => (html = html.replace(re, t)));
    return html;
  }

  async function copyHtml() {
    const html = mdToHtml(report);
    if ((window as any).ClipboardItem) {
      const item = new (window as any).ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) });
      await (navigator.clipboard as any).write([item]);
    } else {
      await navigator.clipboard.writeText(html);
    }
    alert("Copied as HTML. Paste into Gmail/Outlook.");
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>Aligned — Candidate Summary</h1>
      <p style={{ color: "#5b6b8a", marginTop: 0 }}>
        This page now renders the **Trust Report** from your stored inputs. Use the Copy buttons to paste into email.
      </p>

      {loading && <p>Loading…</p>}
      {error && <pre style={{ color: "#b00020", whiteSpace: "pre-wrap" }}>{error}</pre>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Trust Report */}
          <section>
            <h2>Trust Report</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={regenerate} style={{ padding: "8px 12px", borderRadius: 8 }}>Regenerate</button>
              <button onClick={copyMarkdown} disabled={!report} style={{ padding: "8px 12px", borderRadius: 8 }}>
                Copy (Markdown)
              </button>
              <button onClick={copyHtml} disabled={!report} style={{ padding: "8px 12px", borderRadius: 8 }}>
                Copy as HTML
              </button>
            </div>
            <div style={{ background: "#0b1020", color: "#e7f1ff", padding: 16, borderRadius: 8 }}>
              {report ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown> : <em>No report</em>}
            </div>
          </section>

          {/* Original Inputs */}
          <section>
            <h2>Original Inputs</h2>
            <details open style={{ marginBottom: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>Header</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>
Name: {inputs.candidateName || ""}
Title: {inputs.candidateTitle || ""}
Location: {inputs.location || ""}
Industry Fit: {inputs.industryFit || ""}
              </pre>
            </details>

            <details open style={{ marginBottom: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>Job Description</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{inputs.jobDescription || ""}</pre>
            </details>

            <details open style={{ marginBottom: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>Recruiter Notes</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{inputs.recruiterNotes || ""}</pre>
            </details>

            <details style={{ marginBottom: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>Hiring Manager Transcript</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{inputs.hmTranscript || ""}</pre>
            </details>

            <details style={{ marginBottom: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>Candidate Resume</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{inputs.candidateResume || ""}</pre>
            </details>

            <details style={{ marginBottom: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>Candidate Call Transcript</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{inputs.candidateCall || ""}</pre>
            </details>
          </section>
        </div>
      )}
    </div>
  );
}

import type { GetServerSideProps } from 'next';
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
