"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Tell Next not to prerender this client page (fixes build error)
export const dynamic = "force-dynamic";

function NewSummaryForm() {
  const [title, setTitle] = useState("");
  const [candidate, setCandidate] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const backTo = params.get("back") || "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, candidate, notes })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create summary");
        setBusy(false);
        return;
      }
      router.replace(backTo);
    } catch (err: any) {
      setError(err?.message || "Network error");
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Summary</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block mb-1">Title *</span>
          <input
            className="w-full border rounded px-3 py-2"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Candidate X — Screening Summary"
          />
        </label>

        <label className="block">
          <span className="block mb-1">Candidate</span>
          <input
            className="w-full border rounded px-3 py-2"
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="block">
          <span className="block mb-1">Notes</span>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[140px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste raw notes here…"
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="border rounded px-4 py-2">
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => router.back()} className="border rounded px-4 py-2">
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

export default function NewSummaryPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl p-6"><p>Loading…</p></main>}>
      <NewSummaryForm />
    </Suspense>
  );
}
