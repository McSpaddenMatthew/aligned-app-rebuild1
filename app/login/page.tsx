"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const SITE = process.env.NEXT_PUBLIC_SITE_URL!;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <section className="max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-slate-600">
        Magic link only. No passwords.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        {sent ? (
          <p>Check your email for a magic link.</p>
        ) : (
          <form onSubmit={sendLink} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border px-3 py-2"
            />
            <button type="submit" className="w-full rounded-xl border px-3 py-2 hover:bg-slate-50">
              Send magic link
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}


