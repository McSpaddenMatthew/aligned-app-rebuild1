import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };

function parseToFields(text: string) {
  const get = (label: string) =>
    (text.match(new RegExp(`${label}:([\\s\\S]*?)(\\n[A-Z][\\w ]+:|$)`, "i")) || [,""])[1].trim();
  return {
    candidateName:   get("Candidate Name"),
    candidateTitle:  get("Candidate Title"),
    location:        get("Location"),
    industryFit:     get("Industry Fit"),
    jobDescription:  get("Job Description"),
    recruiterNotes:  get("Recruiter Notes"),
    hmTranscript:    get("Hiring Manager Transcript|HM Transcript"),
    candidateResume: get("Candidate Resume"),
    candidateCall:   get("Candidate Call Transcript|Candidate Call"),
  };
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body = parseToFields(userMsg.content);
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      const reply: Msg = {
        role: "assistant",
        content: json.generated || (json.error ? `**Error:** ${json.error}\n\n${json.details || ""}` : "No content."),
      };
      setMessages((m) => [...m, reply]);
      setTimeout(() => document.getElementById("bottom")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `**Error:** ${e?.message || String(e)}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown(text: string) {
    await navigator.clipboard.writeText(text);
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
    // extremely light table support (good enough for our two-column table)
    html = html
      .replace(/\| *([^|\n]+) *\|/g, "<td>$1</td>")
      .replace(/<td>(.*?)<\/td>\s*<td>(.*?)<\/td>/g, "<tr><td>$1</td><td>$2</td></tr>")
      .replace(/<tr>/, "<table><tbody><tr>")
      .replace(/<\/tr>$/, "</tr></tbody></table>");
    return html;
  }

  async function copyHtml(text: string) {
    const html = mdToHtml(text);
    if ((window as any).ClipboardItem) {
      const item = new (window as any).ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) });
      await (navigator.clipboard as any).write([item]);
    } else {
      await navigator.clipboard.writeText(html);
    }
    alert("Copied as HTML. Paste into Gmail/Outlook composer.");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1>Aligned — Chat</h1>
      <p style={{ color: "#5b6b8a" }}>
        Paste raw inputs or use labels:<br/>
        <code>Candidate Name:</code> <code>Candidate Title:</code> <code>Location:</code> <code>Industry Fit:</code><br/>
        <code>Job Description:</code> <code>Recruiter Notes:</code> <code>HM Transcript:</code> <code>Candidate Resume:</code> <code>Candidate Call Transcript:</code>
      </p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        placeholder={`Candidate Name: Ava Patel
Candidate Title: Senior Data Engineer
Location: Austin, TX
Industry Fit: Value-based care analytics
Job Description: ...
Recruiter Notes: ...
HM Transcript: [00:14] ...
Candidate Resume: ...
Candidate Call Transcript: [03:10] ...`}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d0d7e2", fontFamily: "ui-monospace, Menlo, SFMono-Regular" }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={send} disabled={loading} style={{ padding: "10px 14px", borderRadius: 8 }}>
          {loading ? "Generating..." : "Send"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 16,
            background: m.role === "assistant" ? "#0b1020" : "#f6f8fd",
            color: m.role === "assistant" ? "#e7f1ff" : "#111",
            padding: 16, borderRadius: 8
          }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              {m.role === "assistant" ? "Aligned" : "You"}
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            {m.role === "assistant" && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => copyMarkdown(m.content)} style={{ padding: "6px 10px", borderRadius: 6 }}>
                  Copy (Markdown)
                </button>
                <button onClick={() => copyHtml(m.content)} style={{ padding: "6px 10px", borderRadius: 6 }}>
                  Copy as HTML
                </button>
              </div>
            )}
          </div>
        ))}
        <div id="bottom" />
      </div>
    </div>
  );
}
