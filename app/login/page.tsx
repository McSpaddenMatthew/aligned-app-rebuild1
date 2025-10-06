"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// avoid static prerender so useSearchParams runs at runtime
export const dynamic = "force-dynamic";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  // Browser client is the safe choice for client components
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(
            redirectTo
          )}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send magic link");
    }
  };

  return (
    <div className="max-w-md w-full space-y-5 p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <h1 className="text-center text-2xl font-semibold text-slate-900">Sign in</h1>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
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

          <button
            type="submit"
            className="w-full rounded-xl bg-black text-white py-2 font-semibold hover:bg-slate-800"
          >
            Send Magic Link
          </button>
        </form>
      ) : (
        <div className="text-center text-slate-700">
          <p className="text-lg font-medium">Check your email</p>
          <p className="mt-2 text-sm text-slate-500">
            We sent a magic link to <strong>{email}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <Suspense fallback={<div className="text-slate-600">Loading…</div>}>
        <LoginInner />
      </Suspense>
    </main>
  );
}
