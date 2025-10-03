// pages/login.tsx
import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const next = (router.query.next as string) || "/dashboard";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setMsg("Check your email for the login link.");
    } catch (err: any) {
      setMsg(err.message || "Could not send link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head><title>Login • Aligned</title></Head>
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
          <form onSubmit={sendLink} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="you@company.com"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-[#0A0A0A] px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Sending..." : "Send magic link"}
            </button>
            {msg && <p className="text-sm text-[#475569]">{msg}</p>}
          </form>

          <div className="mt-6">
            <Link href="/" className="text-sm underline">Back to Home</Link>
          </div>
        </div>
      </main>
    </>
  );
}


