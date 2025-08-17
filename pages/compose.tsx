import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Inputs = {
  candidateName?: string;
  candidateTitle?: string;
  location?: string;

  candidateCall: string;   // REQUIRED
  jobDescription: string;  // REQUIRED
  hmTranscript: string;    // REQUIRED

  candidateResume?: string;
  roleContext?: string;    // recruiterNotes
};

export default function Compose() {
  const [form, setForm] = useState<Inputs>({
    candidateName: "",
    candidateTitle: "",
    location: "",
    candidateCall: "",
    jobDescription: "",
    hmTranscript: "",
    candidateResume: "",
    roleContext: "",
  });
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requiredMissing = useMemo(() => {
    const miss:string[] = [];
    if (!form.candidateCall.trim()) miss.push("Candidate Call");
    if (!form.jobDescription.trim()) miss.push("Job Description");
    if (!form.hmTranscript.trim()) miss.push("HM Conversation");
    return miss;
  }, [form]);

  function update<K extends keyof Inputs>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function generate() {
    if (requiredMissing.length) return;
    setLoading(true); setError(""); setOut("");
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: form.candidateName,
          candidateTitle: form.candidateTitle,
          location: form.location,
          candidateCall: form.candidateCall,
          jobDescription: form.jobDescription,
          hmTranscript: form.hmTranscript,
          candidateResume: form.candidateResume,
          recruiterNotes: form.roleContext,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Generation failed");
      setOut(json.generated || "");
    } catch (e:any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    alert("Copied (Markdown).");
  }

  function mdToHtml(md: string) {
    const reps:[RegExp,string][] = [
      [/^###### (.*$)/gim,"<h6>$1</h6>"],[/^##### (.*$)/gim,"<h5>$1</h5>"],
      [/^#### (.*$)/gim,"<h4>$1</h4>"], [/^### (.*$)/gim,"<h3>$1</h3>"],
      [/^## (.*$)/gim,"<h2>$1</h2>"],  [/^# (.*$)/gim,"<h1>$1</h1>"],
      [/\*\*(.*?)\*\*/gim,"<strong>$1</strong>"], [/\*(.*?)\*/gim,"<em>$1</em>"],
      [/`([^`]+)`/gim,"<code>$1</code>"], [/\n$/gim,"<br/>"],
    ];
    let html = md; reps.forEach(([r,t]) => html = html.replace(r,t)); return html;
  }

  async function copyHtml() {
    if (!out) return;
    const html = mdToHtml(out);
    if ((window as any).ClipboardItem) {
      const data = new Blob([html], { type: "text/html" });
      const item = new (window as any).ClipboardItem({ "text/html": data });
      await (navigator.clipboard as any).write([item]);
    } else {
      await navigator.clipboard.writeText(html);
    }
    alert("Copied as HTML.");
  }

  const Row = (p:{label:string;k?:keyof Inputs;required?:boolean;multiline?:boolean;placeholder?:string}) => (
    <div className="row">
      <label className="lbl">
        {p.label}{p.required && <span className="req">*</span>}
      </label>
      {p.multiline ? (
        <textarea
          value={p.k ? (form[p.k] as string) || "" : ""}
          onChange={p.k ? update(p.k) : undefined}
          rows={8}
          className="inp mono"
          placeholder={p.placeholder || ""}
        />
      ) : (
        <input
          value={p.k ? (form[p.k] as string) || "" : ""}
          onChange={p.k ? update(p.k) : undefined}
          className="inp"
          placeholder={p.placeholder || ""}
        />
      )}
    </div>
  );

  return (
    <div className="wrap">
      <h1 className="h1">Compose Trust Report</h1>
      <p className="sub">Fill the 3 required fields. Click Generate. Copy into email.</p>

      <div className="grid">
        <div className="card">
          <div className="tri">
            <Row label="Candidate Name"   k="candidateName" placeholder="Full name" />
            <Row label="Candidate Title"  k="candidateTitle" placeholder="Role title" />
            <Row label="Location"         k="location"       placeholder="City, ST" />
          </div>

          <Row label="Candidate Call" k="candidateCall" required multiline
               placeholder="Key quotes or takeaways (timestamps OK)" />
          <Row label="Job Description — must-haves" k="jobDescription" required multiline
               placeholder="What must this person do? (skills + outcomes)" />
          <Row label="HM Conversation" k="hmTranscript" required multiline
               placeholder="What the HM said about needs, risks, 'good'." />

          <Row label="Candidate Resume (optional)" k="candidateResume" multiline placeholder="Paste bullets or summary" />
          <Row label="Role / Company Intel (optional)" k="roleContext" multiline placeholder="Extra context the recruiter knows" />

          {requiredMissing.length > 0 && (
            <div className="note warn">Missing: {requiredMissing.join(", ")}</div>
          )}
          {error && <div className="note err">{error}</div>}

          <div className="actions">
            <button className="btn primary" onClick={generate} disabled={loading || requiredMissing.length>0}>
              {loading ? "Generating…" : "Generate"}
            </button>
            <button className="btn" onClick={copyMarkdown} disabled={!out}>Copy (MD)</button>
            <button className="btn" onClick={copyHtml} disabled={!out}>Copy (HTML)</button>
          </div>
        </div>

        <div className="side">
          <div className="card sticky">
            <h2 className="h2">Preview</h2>
            <div className="preview">
              {out ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{out}</ReactMarkdown>
                   : <span className="muted">Report renders here…</span>}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(html,body){background:#fafbff}
        .wrap{max-width:1200px;margin:0 auto;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system;color:#0f172a}
        .h1{margin:0 0 6px;font-size:24px;font-weight:700}
        .sub{margin:0 0 14px;color:#5b6b8a}
        .grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:1000px){.grid{grid-template-columns:1.05fr .95fr}}
        .card{background:#fff;border:1px solid #e6ebf3;border-radius:12px;padding:16px}
        .sticky{position:sticky;top:16px}
        .tri{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:8px}
        @media(min-width:800px){.tri{grid-template-columns:1fr 1fr 1fr}}
        .row{margin-bottom:10px}
        .lbl{display:block;font-weight:600;margin-bottom:6px}
        .req{color:#b00020;margin-left:2px}
        .inp{width:100%;padding:10px 12px;border:1px solid #d0d7e2;border-radius:10px;background:#fff;outline:none}
        .inp:focus{border-color:#8fb3ff;box-shadow:0 0 0 3px rgba(56,126,255,.15)}
        .mono{font-family:ui-monospace,Menlo,SFMono-Regular,Consolas,monospace}
        .note{padding:10px 12px;border-radius:10px;margin:6px 0 10px;font-size:14px}
        .warn{background:#fff7e6;border:1px solid #ffd7a0;color:#7a4b00}
        .err{background:#ffefef;border:1px solid #ffcfcf;color:#9a1a1a}
        .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
        .btn{padding:10px 14px;border-radius:10px;border:1px solid #d0d7e2;background:#f7f9fc;cursor:pointer}
        .btn:hover{background:#eef3fb}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .btn.primary{background:#0b66ff;color:#fff;border-color:#0b66ff}
        .btn.primary:hover{background:#0957d9}
        .h2{margin:0 0 8px;font-size:18px;font-weight:700}
        .preview{border:1px solid #e6ebf3;border-radius:10px;padding:16px;background:#0b1020;color:#e7f1ff;min-height:160px}
        .muted{opacity:.6}
      `}</style>
    </div>
  );
}
