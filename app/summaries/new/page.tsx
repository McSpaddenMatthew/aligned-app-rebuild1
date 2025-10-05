"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm
      placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 ${props.className || ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm
      placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 ${props.className || ""}`}
    />
  );
}

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
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">Create Summary</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Title *">
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., VP, Data — First Screen" />
        </Field>

        <Field label="Candidate (optional)">
          <Input value={candidate} onChange={(e) => setCandidate(e.target.value)} placeholder="Jane Doe" />
        </Field>

        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste raw notes here…" rows={8} />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
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
