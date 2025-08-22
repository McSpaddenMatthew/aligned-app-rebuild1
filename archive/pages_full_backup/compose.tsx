// pages/compose.tsx
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GetServerSideProps } from "next";

type Inputs = {
  candidateName?: string;
  candidateTitle?: string;
  location?: string;

  // REQUIRED
  candidateCall: string;
  jobDescription: string;
  hmTranscript: string;

  // OPTIONAL
  candidateResume?: string;
  roleContext?: string; // recruiterNotes
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
    const miss: string[] = [];
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
    } catch (e: any) {
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
    const reps: [RegExp, string][] = [
      [/^###### (.*$)/gim, "<h6>$1</h6>"], [/^##### (.*$)/gim, "<h5>$1</h5>"],
      [/^#### (.*$)/gim, "<h4>$1</h4>"],   [/^### (.*$)/gim, "<h3>$1</h3>"],
      [/^## (.*$)/gim, "<h2>$1</h2>"],    [/^# (.*$)/gim, "<h1>$1</h1>"],
      [/\*\*(.*?)\*\*/gim, "<strong>$1</strong>"], [/\*(.*?)\*/gim, "<em>$1</em>"],
      [/`([^`]+)`/gim, "<code>$1</code>"], [/\n$/gim, "<br/>"],
    ];
    let html = md;
    reps.forEach(([r, t]) => (html = html.replace(r, t)));
    return html;
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
    alert("Copied (HTML).");
  }

  const Row = (p: { label: string; k?: keyof Inputs; required?: boolean; multiline?: boolean }) => (
    <div className="row">
      <div className="labelWrap">
        <label className="label">{p.label}{p.required && <span className="req">*</span>}</label>
      </div>
      {p.multiline ? (
        <textarea
          value={p.k ? (form[p.k] as string) || "" : ""}
          onChange={p.k ? update(p.k) : undefined}
          rows={8}
          className="input mono"
        />
      ) : (
        <input
          value={p.k ? (form[p.k] as string) || "" : ""}
          onChange={p.k ? update(p.k) : undefined}
          className="input"
        />
      )}
    </div>
  );

  return (
    <div className="wrap">
      <div className="head">
        <h1>Compose</h1>
        <div className="actionsTop">
          <button className="btn primary" onClick={generate} disabled={loading || requiredMissing.length>0}>
            {loading ? "Generating…" : "Generate"}
          </button>
          <button className="btn" onClick={copyMarkdown} disabled={!out}>Copy MD</button>
          <button className="btn" onClick={copyHtml} disabled={!out}>Copy HTML</button>
        </div>
      </div>

      <div className="grid">
        {/* LEFT */}
        <div className="card">
          <div className="tri">
            <Row label="Candidate Name"  k="candidateName" />
            <Row label="Candidate Title" k="candidateTitle" />
            <Row label="Location"        k="location" />
          </div>

          <Row label="Candidate Call"           k="candidateCall" required multiline />
          <Row label="Job Description"          k="jobDescription" required multiline />
          <Row label="HM Conversation"          k="hmTranscript"   required multiline />
          <Row label="Candidate Resume (opt.)"  k="candidateResume" multiline />
          <Row label="Role / Company Intel (opt.)" k="roleContext"  multiline />

          {requiredMissing.length > 0 && (
            <div className="note warn">Missing: {requiredMissing.join(", ")}</div>
          )}
          {error && <div className="note err">{error}</div>}

          <div className="actionsBottom">
            <button className="btn primary" onClick={generate} disabled={loading || requiredMissing.length>0}>
              {loading ? "Generating…" : "Generate"}
            </button>
            <button className="btn" onClick={copyMarkdown} disabled={!out}>Copy MD</button>
            <button className="btn" onClick={copyHtml} disabled={!out}>Copy HTML</button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="side">
          <div className="card sticky">
            <div className="previewHeader">Preview</div>
            <div className="preview">
              {out ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{out}</ReactMarkdown>
                   : <span className="muted">Report renders here…</span>}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(html,body){background:#fff}
        .wrap{max-width:1200px;margin:0 auto;padding:28px 24px;font-family:ui-sans-serif,system-ui,-apple-system;color:#0a0a0a}
        .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
        h1{font-size:26px;font-weight:800;letter-spacing:-0.01em;margin:0}
        .grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:1000px){.grid{grid-template-columns:1.05fr .95fr}}
        .card{background:#fff;border:1px solid #e6e6e6;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
        .sticky{position:sticky;top:16px}
        .tri{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:8px}
        @media(min-width:800px){.tri{grid-template-columns:1fr 1fr 1fr}}
        .row{margin-bottom:12px}
        .labelWrap{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
        .label{font-weight:700;font-size:13.5px;text-transform:uppercase;letter-spacing:.06em}
        .req{color:#ff6a00;margin-left:6px}
        .input{width:100%;padding:12px 12px;border:1px solid #cfcfcf;border-radius:10px;background:#fff;outline:none;font-size:14px}
        .input:focus{border-color:#ff6a00;box-shadow:0 0 0 3px rgba(255,106,0,.18)}
        .mono{font-family:ui-monospace,Menlo,SFMono-Regular,Consolas,monospace}
        .previewHeader{font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.08em;margin-bottom:10px;color:#222}
        .preview{border:1px solid #0f1219;border-radius:10px;padding:16px;background:#0f1219;color:#eef3ff;min-height:160px}
        .muted{opacity:.6}
        .note{padding:10px 12px;border-radius:10px;margin:8px 0 10px;font-size:14px}
        .warn{background:#fff5ec;border:1px solid #ffd2b3;color:#8a3a00}
        .err{background:#ffecec;border:1px solid #ffc7c7;color:#a31212}
        .actionsTop,.actionsBottom{display:flex;gap:10px;flex-wrap:wrap}
        .btn{padding:10px 14px;border-radius:10px;border:1px solid #d4d4d4;background:#f7f7f7;cursor:pointer;font-weight:600}
        .btn:hover{background:#efefef}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .btn.primary{background:#ff6a00;color:#fff;border-color:#ff6a00}
        .btn.primary:hover{background:#e55f00}
      `}</style>
    </div>
  );
}

// ⬇️ Force SSR so Next.js doesn't try to pre-render /compose at build time.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
