import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  roleContext?: string; // maps to recruiterNotes
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

  const [out, setOut] = useState<string>("");
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

  function resetForm() {
    setForm({
      candidateName: "",
      candidateTitle: "",
      location: "",
      candidateCall: "",
      jobDescription: "",
      hmTranscript: "",
      candidateResume: "",
      roleContext: "",
    });
    setOut("");
    setError("");
  }

  // tiny helper
  const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

  // auto-grow textareas
  const autoGrow = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 1200) + "px";
  };

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
          // requireds
          candidateCall: form.candidateCall,
          jobDescription: form.jobDescription,
          hmTranscript: form.hmTranscript,
          // optionals
          candidateResume: form.candidateResume,
          recruiterNotes: form.roleContext, // extra intel
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Generation failed");
      setOut(json.generated || "");
      setTimeout(() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }), 40);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    if (!out) return;
    await navigator.clipboard.writeText(out);
    alert("Trust report copied (Markdown).");
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

  const Field = (props: {
    label: string;
    k?: keyof Inputs;
    required?: boolean;
    multiline?: boolean;
    placeholder?: string;
    helper?: string;
    tall?: boolean; // slightly taller for big fields
  }) => {
    const count =
      props.multiline && props.k ? (
        <span className="count">{words((form[props.k] as string) || "")}w</span>
      ) : null;
    return (
      <div className="field">
        <div className="labelRow">
          <label className="label">
            {props.label} {props.required && <span className="req">*</span>}
          </label>
          {count}
        </div>
        {props.multiline ? (
          <textarea
            value={props.k ? ((form[props.k] as string) || "") : ""}
            onChange={props.k ? update(props.k) : undefined}
            onInput={autoGrow}
            rows={props.tall ? 10 : 6}
            className="input mono"
            placeholder={props.placeholder || ""}
          />
        ) : (
          <input
            value={props.k ? ((form[props.k] as string) || "") : ""}
            onChange={props.k ? update(props.k) : undefined}
            className="input"
            placeholder={props.placeholder || ""}
          />
        )}
        {props.helper && <div className="helper">{props.helper}</div>}
      </div>
    );
  };

  return (
    <div className="wrap">
      <h1 className="h1">Compose Trust Report</h1>
      <p className="sub">
        Required: <b>Candidate Call</b>, <b>Job Description</b>, <b>HM Conversation</b>. Header fields are optional
        (make the headline read cleanly). Generate → Copy into email.
      </p>

      <div className="grid">
        {/* LEFT: form */}
        <div className="card">
          <div className="row3">
            <Field label="Candidate Name" k="candidateName" placeholder="e.g., Ava Patel" />
            <Field label="Candidate Title" k="candidateTitle" placeholder="e.g., Senior Data Engineer" />
            <Field label="Location" k="location" placeholder="e.g., Austin, TX" />
          </div>

          <Field
            label="Candidate Call"
            k="candidateCall"
            required
            multiline
            tall
            placeholder="[00:14] … key quotes; [03:10] … decisions; anything that shows judgment"
            helper="Use short quotes + timestamps when you have them."
          />

          <Field
            label="Job Description — must-haves"
            k="jobDescription"
            required
            multiline
            placeholder="Must-have capabilities. Tech + outcomes + collaboration requirements."
          />

          <Field
            label="HM Conversation"
            k="hmTranscript"
            required
            multiline
            placeholder="What the HM said about the role, risks, and what 'good' looks like."
            helper="Highest-weight input. If conflicts arise, HM overrides."
          />

          <Field
            label="Candidate Resume (optional)"
            k="candidateResume"
            multiline
            placeholder="Paste raw resume or bullets. Treated as low-trust corroboration."
          />

          <Field
            label="Role / Company Intel (optional)"
            k="roleContext"
            multiline
            placeholder="Anything else the recruiter knows about the role or company context."
          />

          {requiredMissing.length > 0 && (
            <div className="note warn">Missing required: {requiredMissing.join(", ")}</div>
          )}

          {error && <div className="note err">{error}</div>}

          <div className="actions">
            <button className="btn primary" onClick={generate} disabled={loading || requiredMissing.length > 0}>
              {loading ? "Generating…" : "Generate Trust Report"}
            </button>
            <button className="btn" onClick={copyMarkdown} disabled={!out}>
              Copy (Markdown)
            </button>
            <button className="btn" onClick={copyHtml} disabled={!out}>
              Copy as HTML
            </button>
            <button className="btn ghost" onClick={resetForm} disabled={loading}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT: preview */}
        <div className="side">
          <div className="card sticky">
            <h2 className="h2">Preview</h2>
            <div className="preview">
              {out ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{out}</ReactMarkdown>
              ) : (
                <span className="muted">Your trust report will render here…</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(html, body) { background: #fafbff; }
        .wrap { padding: 24px; max-width: 1200px; margin: 0 auto; font-family: ui-sans-serif, system-ui, -apple-system; color: #0f172a; }
        .h1 { margin: 0 0 6px; font-size: 26px; font-weight: 700; letter-spacing: -0.01em; }
        .sub { margin: 0 0 16px; color: #5b6b8a; }

        .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 1000px) {
          .grid { grid-template-columns: 1.1fr 0.9fr; }
        }

        .card { background: #fff; border: 1px solid #e6ebf3; border-radius: 12px; padding: 16px; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04); }
        .side .card.sticky { position: sticky; top: 16px; }

        .row3 { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 8px; }
        @media (min-width: 800px) {
          .row3 { grid-template-columns: 1fr 1fr 1fr; }
        }

        .field { margin-bottom: 12px; }
        .labelRow { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .label { font-weight: 600; }
        .req { color: #b00020; margin-left: 2px; }
        .count { font-size: 12px; color: #6b7b94; }

        .input { width: 100%; padding: 10px 12px; border: 1px solid #d0d7e2; border-radius: 10px; background: #fff; outline: none; }
        .input:focus { border-color: #8fb3ff; box-shadow: 0 0 0 3px rgba(56, 126, 255, 0.15); }
        .mono { font-family: ui-monospace, Menlo, SFMono-Regular, Consolas, monospace; }

        .helper { margin-top: 6px; font-size: 12px; color: #6b7b94; }

        .note { padding: 10px 12px; border-radius: 10px; margin: 6px 0 10px; font-size: 14px; }
        .warn { background: #fff7e6; border: 1px solid #ffd7a0; color: #7a4b00; }
        .err { background: #ffefef; border: 1px solid #ffcfcf; color: #9a1a1a; }

        .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
        .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #d0d7e2; background: #f7f9fc; cursor: pointer; }
        .btn:hover { background: #eef3fb; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn.primary { background: #0b66ff; color: white; border-color: #0b66ff; }
        .btn.primary:hover { background: #0957d9; }
        .btn.ghost { background: white; }

        .h2 { margin: 0 0 10px; font-size: 18px; font-weight: 700; }
        .preview { border: 1px solid #e6ebf3; border-radius: 10px; padding: 16px; background: #0b1020; color: #e7f1ff; min-height: 160px; }
        .muted { opacity: 0.6; }
      `}</style>
    </div>
  );
}
