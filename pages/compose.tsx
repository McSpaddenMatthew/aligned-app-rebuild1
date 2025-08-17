import { useState } from "react";
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

export default function Compose() {
  const [form, setForm] = useState<Inputs>({
    candidateName: "", candidateTitle: "", location: "", industryFit: "",
    jobDescription: "", recruiterNotes: "", hmTranscript: "", candidateResume: "", candidateCall: "",
  });

  const [out, setOut] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof Inputs>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function generate() {
    setLoading(true); setError(""); setOut("");
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Generation failed");
      setOut(json.generated || "");
      setTimeout(() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) { setError(e?.message || "Error"); }
    finally { setLoading(false); }
  }

  async function copyMarkdown() {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    alert("Trust report copied (Markdown). Paste into email and edit freely.");
  }

  function markdownToHtml(md: string) {
    const replacements: [RegExp, string][] = [
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
    replacements.forEach(([r, t]) => (html = html.replace(r, t)));
    return html;
  }

  async function copyHtml() {
    if (!out) return;
    const html = markdownToHtml(out);
    if ((window as any).ClipboardItem) {
      const data = new Blob([html], { type: "text/html" });
      const item = new (window as any).ClipboardItem({ "text/html": data });
      await (navigator.clipboard as any).write([item]);
      alert("Trust report copied as HTML.");
    } else {
      await navigator.clipboard.writeText(html);
      alert("HTML copied to clipboard.");
    }
  }

  const Row = (props: { label: string; k: keyof Inputs; multiline?: boolean }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{props.label}</label>
      {props.multiline ? (
        <textarea
          value={(form[props.k] as string) || ""}
          onChange={update(props.k)}
          rows={props.k === "hmTranscript" || props.k === "candidateCall" ? 8 : 5}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d0d7e2", fontFamily: "ui-monospace, Menlo, SFMono-Regular" }}
        />
      ) : (
        <input value={(form[props.k] as string) || ""} onChange={update(props.k)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d0d7e2" }} />
      )}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
      <h1 style={{ marginBottom: 6 }}>Aligned — Compose Trust Report</h1>
      <p style={{ marginTop: 0, color: "#5b6b8a" }}>
        Paste your JD/notes/transcripts. Click <strong>Generate</strong>, then <strong>Copy</strong> and drop into email.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Row label="Candidate Name" k="candidateName" />
        <Row label="Candidate Title" k="candidateTitle" />
        <Row label="Location" k="location" />
        <Row label="Industry Fit (short line)" k="industryFit" />
      </div>

      <Row label="Job Description" k="jobDescription" multiline />
      <Row label="Recruiter Notes" k="recruiterNotes" multiline />
      <Row label="Hiring Manager Transcript (timestamps ok)" k="hmTranscript" multiline />
      <Row label="Candidate Resume (raw ok)" k="candidateResume" multiline />
      <Row label="Candidate Call Transcript (timestamps ok)" k="candidateCall" multiline />

      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={generate} disabled={loading} style={{ padding: "10px 14px", borderRadius: 8 }}>
          {loading ? "Generating..." : "Generate Trust Report"}
        </button>
        <button onClick={copyMarkdown} disabled={!out} style={{ padding: "10px 14px", borderRadius: 8 }}>
          Copy Trust Report (Markdown)
        </button>
        <button onClick={copyHtml} disabled={!out} style={{ padding: "10px 14px", borderRadius: 8 }}>
          Copy as HTML (rich paste)
        </button>
      </div>

      {error && <pre style={{ marginTop: 16, color: "#b00020", whiteSpace: "pre-wrap" }}>{error}</pre>}

      <div id="preview" style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Preview</h2>
        <div style={{ border: "1px solid #d0d7e2", borderRadius: 8, padding: 16, background: "#0b1020", color: "#e7f1ff" }}>
          {out ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{out}</ReactMarkdown> : <span style={{ opacity: 0.7 }}>Your trust report will render here…</span>}
        </div>
      </div>
    </div>
  );
}
