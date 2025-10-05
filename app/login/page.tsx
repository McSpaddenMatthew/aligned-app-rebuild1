"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

// Force dynamic so Next doesn't try to prerender /login
export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/dashboard";
  const [busy, setBusy] = useState(true);
  const supabase = supabaseBrowser();

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (!cancelled) router.replace(redirectTo);
        return;
      }

      // Handle hash tokens (older flow): #access_token=...&refresh_token=...
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.slice(1);
        const search = new URLSearchParams(hash);
        const access_token = search.get("access_token");
        const refresh_token = search.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error) {
            const clean = window.location.pathname + window.location.search;
            window.history.replaceState(null, "", clean);
            if (!cancelled) router.replace(redirectTo);
            return;
          }
        }
      }
      setBusy(false);
    }
    void init();
    return () => { cancelled = true; };
  }, [router, redirectTo, supabase]);

  return (
    <main className="mx-auto max-w-md p-6">
      {busy ? <p>Finishing sign-in…</p> : <LoginForm />}
    </main>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/dashboard";
  const supabase = supabaseBrowser();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(
          redirectTo
        )}`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) return <p>Check your email for the magic link.</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block mb-1">Email</span>
        <input
          type="email"
          required
          className="w-full border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button type="submit" className="w-full border px-3 py-2 rounded">
        Send Magic Link
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md p-6">
          <p>Loading…</p>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
