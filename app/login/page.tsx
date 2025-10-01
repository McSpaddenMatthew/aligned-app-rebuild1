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
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const SITE = process.env.NEXT_PUBLIC_SITE_URL!; // e.g. https://your-app.vercel.app
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Log in</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded px-3 py-2 border"
          >
            Send magic link
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </main>
  );
}

