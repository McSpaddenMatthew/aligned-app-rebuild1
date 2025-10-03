"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setLoading(false);
    });
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    await supabase.from("summaries").insert({
      user_id: user.id,
      title: title || "Untitled",
      content: { raw: notes },
    });
    router.push("/summaries");
  }

  if (loading) return <p>Loading…</p>;

  return (
    <section className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">New Candidate Summary</h1>

      <form onSubmit={save} className="mt-6 rounded-2xl border p-4 space-y-4">
        <div>
          <label className="text-sm text-slate-600">Title</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="e.g., VP Data Strategy — Jane Doe"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">Candidate notes</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={8}
            placeholder="Paste raw notes here…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl border px-4 py-2 hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <a href="/summaries" className="rounded-xl px-4 py-2 underline underline-offset-4">
            Cancel
          </a>
        </div>
      </form>
    </section>
  );
}

