// app/login/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

// ---------- Minimal browser Supabase singleton ----------
let _sb: SupabaseClient | null = null;
function useSupabaseBrowser() {
  return useMemo(() => {
    if (_sb) return _sb;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _sb = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return _sb;
  }, []);
}

export default function LoginPage() {
  const supabase = useSupabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();

  // ✅ This was missing in your file
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectAfterLogin = "/summaries/new";

  // If already signed in, go forward
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(redirectAfterLogin);
    });
  }, [router, supabase]);

  // Surface auth errors from callback if any
  useEffect(() => {
    const err = params.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [params]);

  // Send magic link -> server callback sets cookies -> redirect to /summaries/new
  const handleSendLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSending(true);
      setError(null);
      setNotice(null);

      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";

        const redirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(
          redirectAfterLogin
        )}`;

        // Debug (optional)
        console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("Sending magic link to:", email.trim());
        console.log("Redirect to:", redirectTo);

        if (!email.trim()) {
          throw new Error("Please enter an email address.");
        }

        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true,
          },
        });

        if (error) {
          console.error("signInWithOtp error:", error);
          throw error;
        }
        console.log("signInWithOtp response:", data);

        setNotice("Magic link sent. Check your email to finish signing in.");
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong sending your magic link.");
      } finally {
        setSending(false);
      }
    },
    [email, redirectAfterLogin, supabase]
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="text-sm text-gray-500 mt-1">
              We’ll email you a one-time magic link.
            </p>
          </div>

          <form onSubmit={handleSendLink} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-800"
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-black text-white py-3 font-medium disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send magic link"}
            </button>
          </form>

          {notice && (
            <div className="mt-4 rounded-lg bg-green-50 text-green-800 text-sm p-3">
              {notice}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 text-red-800 text-sm p-3">
              {error}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            By continuing, you agree to our Terms and acknowledge our Privacy
            Policy.
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          The magic link hits <code>/api/auth/callback</code> to set cookies,
          then sends you to <code>{redirectAfterLogin}</code>.
        </p>
      </div>
    </main>
  );
}
