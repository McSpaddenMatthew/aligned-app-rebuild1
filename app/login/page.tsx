"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const errorFromCallback = searchParams.get("error");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error("Error sending magic link:", error);
        setStatus("error");
        setMessage(error.message || "Error sending magic link.");
        return;
      }

      setStatus("sent");
      setMessage("Check your email for a magic link to sign in.");
    } catch (err) {
      console.error("Unexpected error sending magic link:", err);
      setStatus("error");
      setMessage("Unexpected error sending magic link.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-semibold text-white">
          Aligned Login
        </h1>
        <p className="mb-6 text-center text-sm text-slate-300">
          Enter your email to receive a one-time magic link.
        </p>

        {errorFromCallback && (
          <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-200">
            Your sign-in link didn&apos;t work. Please try again.
          </div>
        )}

        {message && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              status === "error"
                ? "border-red-500/60 bg-red-500/10 text-red-200"
                : "border-emerald-500/60 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-200">
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
              placeholder="you@company.com"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending" ? "Sending magic link…" : "Send magic link"}
          </button>
        </form>
      </div>
    </main>
  );
}
