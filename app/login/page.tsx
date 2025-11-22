"use client";

import { useState, FormEvent } from "react";
import Head from "next/head";
import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

type Status = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <>
      <Head>
        <title>Login | Aligned</title>
      </Head>

      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-[3fr,2fr] gap-8 rounded-3xl overflow-hidden bg-gradient-to-br from-black via-slate-900 to-red-950 border border-red-700/40 shadow-2xl">
          {/* Left: Form */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.2em] text-red-400 mb-4">
                ALIGNED LOGIN
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Passwordless access
                <span className="block text-red-400">in under a minute.</span>
              </h1>
              <p className="mt-4 text-sm text-slate-300 max-w-md">
                Use your email to receive a one-time magic link. No passwords,
                just a clean handoff into your dashboard.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <label className="block text-xs font-medium text-slate-200 uppercase tracking-wide">
                  Work email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-2 w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sending magic link…" : "Send magic link"}
                </button>
              </form>

              <div className="mt-4 text-xs text-slate-400">
                Fast path: already have the link? Open it from your email and
                we’ll finish the session on <code>/auth/callback</code> before
                redirecting you to the dashboard.
              </div>

              {status === "sent" && (
                <p className="mt-4 text-sm text-emerald-400">
                  Magic link sent. Check your inbox to continue.
                </p>
              )}

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </div>

            <div className="mt-8 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Route check OK — <code>/login</code> is live.
            </div>
          </div>

          {/* Right: Info card */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-b from-red-900/80 via-black/40 to-black/80 p-8 border-l border-red-800/40">
            <div>
              <div className="inline-flex items-center rounded-full border border-red-400/60 px-3 py-1 text-[11px] font-medium tracking-wide text-red-200 mb-4">
                Design language • Rosso Corsa
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Built for recruiters, trusted by operators.
              </h2>
              <p className="text-sm text-slate-200/90">
                Every session launches you into an evidence-first dashboard
                designed for fast, confident hiring decisions.
              </p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-slate-200/90">
              <li>• Supabase magic link flow wired to /auth/callback.</li>
              <li>• No passwords, no friction — just verified access.</li>
              <li>• Dashboard tiles ready for pipeline health and reports.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
