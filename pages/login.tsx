import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

const SUPA_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!supabase;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email.trim()) return setMsg("Enter your email.");

    try {
      setBusy(true);
      if (SUPA_READY && supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMsg("Check your inbox for the magic link.");
      } else {
        setMsg("Supabase not configured. Use Dev Login below.");
      }
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function devLogin() {
    localStorage.setItem("aligned-dev-auth", "1");
    router.push("/dashboard");
  }

  return (
    <>
      <Head>
        <title>Log in — Aligned</title>
      </Head>
      <main className="section-pad">
        <div className="container-tight">
          <div className="mx-auto max-w-md card">
            <h1 className="h2">Log in</h1>
            <p className="mt-2 text-gray-600">
              We use passwordless login. Enter your email to get a magic link.
            </p>

            <form onSubmit={sendLink} className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button disabled={busy} className="btn btn-primary w-full">
                {busy ? "Sending…" : "Send magic link"}
              </button>
            </form>

            {msg && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                {msg}
              </div>
            )}

            {!SUPA_READY && (
              <div className="mt-6">
                <button onClick={devLogin} className="btn btn-ghost w-full">
                  Continue (Dev Login)
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Dev mode stores a flag in localStorage and skips email.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}


