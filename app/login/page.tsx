"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    setMessage("");

    const origin = window.location.origin; // e.g. https://alignedapp.vercel.app

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // This is where the magic link will send people back
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong.");
      return;
    }

    setStatus("sent");
    setMessage("Check your email for a magic link to sign in.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-md border border-slate-200 px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Sign in to Aligned
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Use your work email to get a secure magic link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              placeholder="you@company.com"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 disabled:opacity-70"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "error" ? "text-red-600" : "text-slate-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
