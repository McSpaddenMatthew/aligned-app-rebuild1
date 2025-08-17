cat > pages/compose.tsx <<'EOF'
import { useMemo, useState } from "react";
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
          recruiterNotes: form.roleContext, // <- extra intel
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Generation failed");
      setOut(json.generated || "");
      setTimeout(() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
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

  const Row = (props: { label: string; k?: keyof Inputs; required?: boolean; multiline?: boolean; placeholder?: string }) => {
    const label = props.required ? `${props.label} *` : props.label;
    const common = { style: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d0d7e2", fontFamily: props.multiline ? "ui-monospace, Menlo, SFMono-Regular" : "inherit" } as React.CSSProperties, placeholder: props.placeholder || "" };
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{label}</label>
        {props.multiline ? (
          <textarea
            value={props.k ? ((form[props.k] as string) || "") : ""}
            onChange={props.k ? update(props.k) : undefined}
            rows={props.k === "candidateCall" ? 10 : 6}
            {...common}
          />
        ) : (
          <input
            value={props.k ? ((form[props.k] as string) || "") : ""}
            onChange={props.k ? update(props.k) : undefined}
            {...common}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
      <h1 style={{ marginBottom: 6 }}>Aligned — Compose Trust Report</h1>
      <p style={{ marginTop: 0, color: "#5b6b8a" }}>
        Minimum inputs: <strong>Candidate Call</strong>, <strong>Job Description</strong>, <strong>HM Conversation</strong>.  
        Name/Title/Location optional (for a clean headline).
      </p>

      {/* Optional header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
        <Row label="Candidate Name" k="candidateName" placeholder="e.g., Ava Patel" />
        <Row label="Candidate Title" k="candidateTitle" placeholder="e.g., Senior Data Engineer" />
        <Row label="Location" k="location" placeholder="e.g., Austin, TX" />
      </div>

      {/* Required core */}
      <Row
        label="Candidate Call (required)"
        k="candidateCall"
        required
        multiline
        placeholder="[00:14] … key quotes; [03:10] … decisions; anything that shows judgment"
      />
      <Row
        label="Job Description — must-haves (required)"
        k="jobDescription"
        required
        multiline
        placeholder="What must this person be able to do? Tech + outcomes + collaboration requirements."
      />
      <Row
        label="HM Conversation (required)"
        k="hmTranscript"
        required
        multiline
        placeholder="What the HM said about the role, risks, and what 'good' looks like. Timestamps OK."
      />

      {/* Optional extras */}
      <Row
        label="Candidate Resume (optional)"
        k="candidateResume"
        multiline
        placeholder="Paste raw resume or bullets. It's OK if this is messy."
      />
      <Row
        label="Role / Company Intel (optional)"
        k="roleContext"
        multiline
        placeholder="Anything else the recruiter knows about the role or company context."
      />

      {requiredMissing.length > 0 && (
        <div style={{ background: "#fff7e6", border: "1px solid #ffd7a0", color: "#7a4b00", padding: 10, borderRadius: 8, margin: "6px 0 10px" }}>
          Missing required: {requiredMissing.join(", ")}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <button onClick={generate} disabled={loading || requiredMissing.length > 0} style={{ padding: "10px 14px", borderRadius: 8 }}>
          {loading ? "Generating..." : "Generate Trust Report"}
        </button>
        <button onClick={copyMarkdown} disabled={!out} style={{ padding: "10px 14px", borderRadius: 8 }}>
          Copy (Markdown)
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
EOF
