"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";

// Stop static prerender for this page (avoids build-time SSR of useSearchParams)
export const dynamic = "force-dynamic";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
    }
  };

  return (
    <>
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">Send Magic Link</Button>
        </form>
      ) : (
        <div className="text-center text-slate-700">
          <p className="text-lg font-medium">Check your email</p>
          <p className="mt-2 text-sm text-slate-500">
            A magic link has been sent to <strong>{email}</strong>.
          </p>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900">Welcome Back</h1>
        <p className="mb-8 text-center text-slate-600">Sign in with your email to continue.</p>

        <Suspense fallback={<div className="text-center text-slate-500">Loading…</div>}>
          <LoginInner />
        </Suspense>
      </div>
    </main>
  );
}
