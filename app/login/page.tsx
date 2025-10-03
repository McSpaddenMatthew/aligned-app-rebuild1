"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);

    const SITE = process.env.NEXT_PUBLIC_SITE_URL!;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE}/auth/callback` },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      {/* Top bar to match homepage */}
      <div className="bg-[#F1F5F9] text-center text-sm py-2">
        AI-powered, evidence-first • White-glove first 3 reports • Built for PE portfolio hiring
      </div>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Log in to <span className="text-[#0A1F44]">Aligned</span>
          </h1>
          <p className="mt-2 text-center text-sm text-[#475569]">
            Magic link only. No passwords.
          </p>

          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            {sent ? (
              <div className="text-center">
                <h2 className="text-lg font-semibold">Check your email</h2>
                <p className="mt-2 text-sm text-[#475569]">
                  We sent a secure sign-in link to <span className="font-medium">{email}</span>.
                </p>
                <p className="mt-2 text-xs text-[#475569]">
                  Didn’t get it? Check spam or try again below.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 px-4 py-2 rounded-lg border hover:bg-[#F1F5F9] text-sm"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={sendLink} className="space-y-4">
                <label className="block text-sm">
                  <span className="text-[#475569]">Work email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-[#0A1F44]"
                  />
                </label>

                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-[#0A1F44] hover:bg-[#07152f] transition disabled:opacity-60"
                >
                  {loading ? "Sending link…" : "Send magic link"}
                </button>

                <p className="text-xs text-[#475569]">
                  By continuing, you agree to receive a one-time sign-in link via email.
                </p>
              </form>
            )}
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm underline underline-offset-4">
              ← Back to homepage
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}


