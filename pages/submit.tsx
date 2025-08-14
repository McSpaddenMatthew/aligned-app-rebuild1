import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

type CandidateData = {
  name: string;
  email?: string;
  location?: string;
  resumeUrl?: string;
  notes?: string;
};

export default function SubmitPage() {
  const r = useRouter();

  // Job / HM inputs
  const [jobDescription, setJobDescription] = useState("");
  const [hiringManagerNotes, setHiringManagerNotes] = useState("");

  // Candidate inputs
  const [candidate, setCandidate] = useState<CandidateData>({ name: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadResumeIfNeeded() {
    if (!resumeFile) return undefined;
    const path = `public/${Date.now()}-${resumeFile.name}`;
    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(path, resumeFile);
    if (error) throw error;
    // public URL for the uploaded file
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${data.path}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resumeUrl = await uploadResumeIfNeeded();
      const payload = {
        jobDescription,
        hiringManagerNotes,
        candidateData: { ...candidate, resumeUrl },
      };

      const res = await fetch("/api/generateSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Request failed");
      }
      const json = await res.json(); // { id, summary }
      // go to read-only page
      r.push(`/summary/${json.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Create Candidate Summary</h1>
        <form className="space-y-6" onSubmit={onSubmit}>
          <section className="space-y-2">
            <label className="block font-medium">Job Description *</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
          </section>

          <section className="space-y-2">
            <label className="block font-medium">Hiring Manager Notes</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={4}
              value={hiringManagerNotes}
              onChange={(e) => setHiringManagerNotes(e.target.value)}
              placeholder="Key signals, must-haves, risks…"
            />
          </section>

          <hr />

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium">Candidate Name *</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={candidate.name}
                onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium">Email</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={candidate.email || ""}
                onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium">Location</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={candidate.location || ""}
                onChange={(e) => setCandidate({ ...candidate, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium">Resume (PDF/DOC) — optional</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
            </div>
          </section>

          <section className="space-y-2">
            <label className="block font-medium">Extra Notes (optional)</label>
            <textarea
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              value={candidate.notes || ""}
              onChange={(e) => setCandidate({ ...candidate, notes: e.target.value })}
            />
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate Summary"}
          </button>
        </form>
      </main>
    </div>
  );
}



