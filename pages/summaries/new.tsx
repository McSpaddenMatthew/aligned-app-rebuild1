import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

/* -------------------- Auth (server) -------------------- */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { global: { headers: { Cookie: ctx.req.headers.cookie ?? "" } } }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { session } };
};

/* -------------------- UI (client) -------------------- */
type Props = { session: Session };

export default function NewSummaryPage({ session }: Props) {
  const email = session.user.email ?? "Signed in";

  // Four clear inputs matching your sketch
  const [hmNotes, setHmNotes] = useState("");
  const [resume, setResume] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [jd, setJd] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstRef = useRef<HTMLTextAreaElement | null>(null);

  // Cmd/Ctrl + Enter to generate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        void onGenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const canGenerate = useMemo(
    () => (hmNotes.trim() || callNotes.trim()) && !loading,
    [hmNotes, callNotes, loading]
  );

  // Combine to a single string for your existing API
  const combinedNotes = useMemo(() => {
    const parts: string[] = [];
    if (hmNotes.trim()) parts.push(`[Hiring Manager Notes]\n${hmNotes.trim()}`);
    if (resume.trim()) parts.push(`[Resume]\n${resume.trim()}`);
    if (callNotes.trim()) parts.push(`[Candidate Call]\n${callNotes.trim()}`);
    if (jd.trim()) parts.push(`[Job Description]\n${jd.trim()}`);
    return parts.join("\n\n");
  }, [hmNotes, resume, callNotes, jd]);

  const onGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: combinedNotes }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
      const data = await res.json();
      setOutput(data.summary ?? "");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onClearAll = () => {
    setHmNotes("");
    setResume("");
    setCallNotes("");
    setJd("");
    setOutput("");
    setError(null);
    firstRef.current?.focus();
  };

  const onLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      <Head>
        <title>Aligned — New Summary</title>
      </Head>

      {/* Top bar */}
      <header className="w-full bg-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
            <span className="font-semibold">Aligned</span>
            <span className="mx-3 h-4 w-px bg-white/20" />
            <nav className="hidden sm:flex items-center gap-4 text-sm text-white/80">
              <a href="/summaries/new" className="hover:text-white">New Summary</a>
              <a href="/" className="hover:text-white">Home</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-white/80">{email}</span>
            <button
              onClick={onLogout}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Stepper */}
        <ol className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          {[
            { n: 1, label: "HM notes" },
            { n: 2, label: "Resume" },
            { n: 3, label: "Candidate call" },
            { n: 4, label: "JD" },
          ].map((s) => (
            <li key={s.n} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-sm font-semibold">
                {s.n}
              </span>
              <span className="font-medium">{s.label}</span>
            </li>
          ))}
        </ol>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Summary</h1>
            <p className="text-sm text-slate-600">
              Fill the boxes below (Step 1 & 3 are the most important).{" "}
              <kbd className="rounded bg-slate-100 px-1">Cmd/Ctrl</kbd> + <kbd className="rounded bg-slate-100 px-1">Enter</kbd> to generate.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className={`rounded-xl px-4 py-2 text-white transition ${
                canGenerate ? "bg-black hover:bg-black/90" : "bg-black/30 cursor-not-allowed"
              }`}
            >
              {loading ? "Generating…" : "Generate"}
            </button>
            <button
              onClick={onClearAll}
              disabled={loading}
              className="rounded-xl border px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: inputs */}
          <section className="space-y-5">
            <Field
              ref={firstRef}
              step={1}
              title="HM notes"
              placeholder={`What the hiring manager actually wants, in their words.\n\n• 90-day BI rebuild → 60-day dashboard\n• Modern stack (Airflow, dbt, Snowflake, Looker)\n• Exec presence; decision → evidence framing`}
              value={hmNotes}
              onChange={setHmNotes}
              required
            />
            <Field
              step={2}
              title="Resume (optional)"
              placeholder={`Paste relevant resume bullets or highlights.`}
              value={resume}
              onChange={setResume}
            />
            <Field
              step={3}
              title="Candidate call"
              placeholder={`What you learned from the call: outcomes, scope, tools, risks, mitigation.`}
              value={callNotes}
              onChange={setCallNotes}
              required
            />
            <Field
              step={4}
              title="Job description (optional)"
              placeholder={`Paste the JD or the key outcomes this role owns.`}
              value={jd}
              onChange={setJd}
            />
          </section>

          {/* Right: output */}
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="text-lg font-semibold">Summary (copy & paste)</h2>
            </div>
            <div className="p-5">
              <div className="h-[520px] w-full rounded-xl border bg-slate-50 p-4 text-sm leading-relaxed">
                {output ? (
                  <pre className="whitespace-pre-wrap break-words font-sans">{output}</pre>
                ) : (
                  <p className="text-slate-500">Your generated summary will appear here.</p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={onCopy}
                  disabled={!output}
                  className={`rounded-xl px-4 py-2 text-white transition ${
                    output ? "bg-black hover:bg-black/90" : "bg-black/30 cursor-not-allowed"
                  }`}
                >
                  {copied ? "Copied ✓" : "Copy Summary"}
                </button>
                <button
                  onClick={() => setOutput("")}
                  disabled={!output}
                  className="rounded-xl border px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Clear Output
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Private to you. Unauthenticated visits redirect to login.
        </p>
      </main>
    </>
  );
}

/* -------- Reusable field component (needs React import) -------- */
type FieldProps = {
  step: number;
  title: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
};

const Field = React.forwardRef<HTMLTextAreaElement, FieldProps>(function Field(
  { step, title, value, onChange, placeholder, required },
  ref
) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-sm font-semibold">
          {step}
        </span>
        <h3 className="text-lg font-semibold">
          {title} {required ? <span className="text-slate-400 text-sm font-normal">(required)</span> : null}
        </h3>
      </div>
      <div className="p-5">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full resize-none rounded-xl border px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>
    </div>
  );
});

