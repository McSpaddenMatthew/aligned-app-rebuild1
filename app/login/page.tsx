"use client";

import React, { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const handleSendLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSending(true);
      setNotice(null);

      try {
        if (!email.trim()) {
          throw new Error("Please enter an email address.");
        }

        const redirectTo = `${window.location.origin}/api/auth/callback?next=/dashboard`;

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true,
          },
        });

        if (error) throw error;

        setNotice("✅ Magic link sent! Check your email to finish signing in.");
      } catch (err: any) {
        setNotice(err.message || "Something went wrong sending your magic link.");
      } finally {
        setSending(false);
      }
    },
    [email]
  );

  return (
    <main className="mx-auto max-w-md py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">Sign in</h1>
      <p className="mb-6 text-slate-600">
        We’ll email you a one-time magic link.
      </p>

      <form onSubmit={handleSendLink} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-md border border-slate-300 px-4 py-2"
          disabled={sending}
        />

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-md bg-black text-white py-2 font-semibold hover:bg-slate-800 transition"
        >
          {sending ? "Sending..." : "Send magic link"}
        </button>
      </form>

      {notice && (
        <p className="mt-4 text-center text-sm text-slate-700">{notice}</p>
      )}
    </main>
  );
}


