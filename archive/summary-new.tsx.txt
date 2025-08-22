// pages/summary/new.tsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function NewSummaryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [candidate, setCandidate] = useState("");
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parts = { hiringManager, candidate, jd, resume, recruiterNotes };

  function Field({
    label,
    value,
    onChange,
    placeholder,
    rows = 8,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
  }) {
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontWeight: 600 }}>{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
          }}
        />
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const hasAny =
      hiringManager.trim() ||
      candidate.trim() ||
      jd.trim() ||
      resume.trim() ||
      recruiterNotes.trim();

    if (!hasAny) {
      setSaving(false);
      setError("Please enter at least one section (HM, Candidate, JD, Resume, or Recruiter Notes).");
      return;
    }

    try {
      const res = await fetch("/api/save-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, parts }), // server composes into `summary`
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      router.push(`/summary/${id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const hasAny =
        hiringManager.trim() ||
        candidate.trim() ||
        jd.trim() ||
        resume.trim() ||
        recruiterNotes.trim();
      if (!hasAny) {
        throw new Error("Please paste at least one section to generate a summary.");
      }

      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, parts }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      router.push(`/summary/${id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to generate.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Create Candidate Summary
      </h1>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
          }}
        />

        <Field
          label="Hiring Manager Call Transcript"
          value={hiringManager}
          onChange={setHiringManager}
          placeholder="Paste the HM call transcript…"
          rows={10}
        />

        <Field
          label="Candidate Call Transcript"
          value={candidate}
          onChange={setCandidate}
          placeholder="Paste the candidate call transcript…"
          rows={10}
        />

        <Field
          label="Job Description (JD)"
          value={jd}
          onChange={setJd}
          placeholder="Paste the JD…"
          rows={8}
        />

        <Field
          label="Resume (optional)"
          value={resume}
          onChange={setResume}
          placeholder="Paste the resume text or key bullets…"
          rows={8}
        />

        <Field
          label="Recruiter Additional Notes on Job (optional)"
          value={recruiterNotes}
          onChange={setRecruiterNotes}
          placeholder="Any extra notes for context…"
          rows={6}
        />

        {error && (
          <div style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={saving || generating}
            style={{
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontWeight: 600,
              opacity: saving || generating ? 0.6 : 1,
            }}
            title="Save raw text without AI"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={saving || generating}
            style={{
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontWeight: 600,
              opacity: saving || generating ? 0.6 : 1,
            }}
            title="Use AI to generate a structured summary"
          >
            {generating ? "Generating…" : "Generate Summary"}
          </button>
        </div>
      </form>
    </main>
  );
}
