import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

type SummaryState = {
  name: string;
  title: string;
  brings: string;   // newline-separated bullets
  outcomes: string;
  risks: string;
  framing: string;
  notes: string;
};

const STORAGE_KEY = "aligned-summary-v1";

function toList(s: string) {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<SummaryState>(() => {
    if (typeof window === "undefined") return {
      name: "", title: "", brings: "", outcomes: "", risks: "", framing: "", notes: ""
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {
        name: "", title: "", brings: "", outcomes: "", risks: "", framing: "", notes: ""
      };
    } catch {
      return { name: "", title: "", brings: "", outcomes: "", risks: "", framing: "", notes: "" };
    }
  });

  // auth gate (Supabase if present; otherwise dev flag)
  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function check() {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) { setReady(true); }
        else {
          unsub = supabase.auth.onAuthStateChange((_e, session) => {
            if (session) setReady(true);
            else router.replace("/login");
          }).data.subscription.unsubscribe;
          router.replace("/login");
        }
      } else {
        const ok = localStorage.getItem("aligned-dev-auth") === "1";
        if (!ok) router.replace("/login");
        else setReady(true);
      }
    }
    check();
    return () => { if (unsub) unsub(); };
  }, [router]);

  // persist to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const preview = useMemo(() => {
    return {
      brings: toList(state.brings),
      outcomes: toList(state.outcomes),
      risks: toList(state.risks),
      framing: toList(state.framing),
    };
  }, [state]);

  function copyText() {
    const blocks = [
      `Candidate: ${state.name || "—"}`,
      state.title ? `Title: ${state.title}` : "",
      "",
      "What You Shared — What the Candidate Brings",
      ...preview.brings.map((b) => `• ${b}`),
      "",
      "Outcomes Delivered",
      ...preview.outcomes.map((b) => `• ${b}`),
      "",
      "Known Risks & Mitigations",
      ...preview.risks.map((b) => `• ${b}`),
      "",
      "How They Frame Data for Leadership Decisions",
      ...preview.framing.map((b) => `• ${b}`),
      state.notes ? `\nNotes:\n${state.notes}` : "",
    ].join("\n");
    navigator.clipboard.writeText(blocks);
  }

  function resetAll() {
    setState({ name: "", title: "", brings: "", outcomes: "", risks: "", framing: "", notes: "" });
  }

  if (!ready) return null;

  return (
    <>
      <Head><title>Dashboard — Aligned</title></Head>
      <main className="section-pad">
        <div className="container-tight grid md:grid-cols-2 gap-6">
          {/* Left: form */}
          <div className="card">
            <h1 className="h3">Create Candidate Summary</h1>

            <div className="mt-4 grid gap-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Candidate name"
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                />
                <input
                  className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Role or headline (e.g., Data Strategy Leader)"
                  value={state.title}
                  onChange={(e) => setState({ ...state, title: e.target.value })}
                />
              </div>

              <Field
                label="What You Shared — What the Candidate Brings"
                placeholder="One bullet per line…"
                value={state.brings}
                onChange={(v) => setState({ ...state, brings: v })}
              />
              <Field
                label="Outcomes Delivered"
                placeholder="One bullet per line…"
                value={state.outcomes}
                onChange={(v) => setState({ ...state, outcomes: v })}
              />
              <Field
                label="Known Risks & Mitigations"
                placeholder="One bullet per line…"
                value={state.risks}
                onChange={(v) => setState({ ...state, risks: v })}
              />
              <Field
                label="How They Frame Data for Leadership Decisions"
                placeholder="One bullet per line…"
                value={state.framing}
                onChange={(v) => setState({ ...state, framing: v })}
              />
              <Field
                label="Notes (optional)"
                placeholder="Free-form notes…"
                value={state.notes}
                onChange={(v) => setState({ ...state, notes: v })}
                rows={4}
              />

              <div className="flex gap-3">
                <button onClick={copyText} className="btn btn-primary">Copy Summary</button>
                <button onClick={resetAll} className="btn btn-ghost">Reset</button>
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="card">
            <div className="flex items-baseline gap-2">
              <h2 className="h3">Preview</h2>
              {state.name || state.title ? (
                <span className="text-gray-500">— {state.name} {state.title ? `· ${state.title}` : ""}</span>
              ) : null}
            </div>

            <PreviewBlock title="What You Shared — What the Candidate Brings" items={preview.brings} />
            <PreviewBlock title="Outcomes Delivered" items={preview.outcomes} />
            <PreviewBlock title="Known Risks & Mitigations" items={preview.risks} />
            <PreviewBlock title="How They Frame Data for Leadership Decisions" items={preview.framing} />
          </div>
        </div>
      </main>
    </>
  );
}

function Field({
  label, value, onChange, placeholder, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        rows={rows}
        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PreviewBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No items yet.</p>
      )}
    </div>
  );
}

