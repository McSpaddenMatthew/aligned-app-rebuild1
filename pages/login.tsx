import { useState, FormEvent } from "react";
import Head from "next/head";
import { createBrowserClient } from "../lib/supabase/client";

const supabase = createBrowserClient();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    // Use NEXT_PUBLIC_SITE_URL if it exists, otherwise fall back to current origin
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900 text-center mb-2">
            Login
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Enter your email and we&apos;ll send you a secure magic link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Work email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                placeholder="you@example.com"
              />
            </label>

            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {status === "loading" ? "Sending link..." : "Send magic link"}
            </button>
          </form>

          <div className="mt-4 text-xs text-slate-500 text-center">
            Route check OK — <code>/login</code> is live.
          </div>

          {status === "sent" && (
            <p className="mt-4 text-sm text-emerald-600 text-center">
              Magic link sent. Check your email.
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}

