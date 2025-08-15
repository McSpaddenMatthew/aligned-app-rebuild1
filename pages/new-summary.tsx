// pages/new-summary.tsx
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { createClient } from "@supabase/supabase-js";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function NewSummaryPage() {
  const router = useRouter();

  const [candidateName, setCandidateName] = useState("");
  const [role, setRole] = useState("");
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErr(null);

      if (!raw.trim()) throw new Error("Please paste something into the summary box.");

      // 🔐 get the currently logged-in user's id
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData?.user?.id || null;

      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: raw,
          candidateName: candidateName || undefined,
          role: role || undefined,
          userId, // 👉 send user_id so DB NOT NULL is satisfied
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to generate/save summary.");
      }

      const j = await res.json();
      const id = j.id as string | undefined;
      if (!id) throw new Error("Saved, but no ID returned.");

      router.push(`/cases/${id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Could not save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Start New Summary – Aligned</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`${inter.variable} min-h-screen bg-neutral-50`}>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">Aligned</div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-4">
            Start a New Summary
          </h1>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">
                  Candidate Name (optional)
                </label>
                <input
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900/10"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Role (optional)</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900/10"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Sr Director of Data"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Paste your summary (Markdown supported)
              </label>
              <textarea
                className="w-full min-h-[180px] rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900/10"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Paste HM notes, JD highlights, candidate quotes, bullet points, etc."
              />
            </div>

            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save & View"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
