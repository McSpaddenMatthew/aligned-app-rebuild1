// pages/login.tsx — magic-link only (no password), handles hash -> sets session -> /dashboard
import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });

// Parse URL hash like: #access_token=...&refresh_token=...&type=recovery
function getHashParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const out: Record<string, string> = {};
  for (const part of raw.split("&")) {
    const [k, v] = part.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return out;
}

export default function Login() {
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  // If we came back from the magic link with tokens in the hash, set the session and go to /dashboard
  useEffect(() => {
    const { access_token, refresh_token, error_description } = getHashParams();
    if (error_description) {
      setMsg(error_description);
      history.replaceState(null, "", window.location.pathname);
      return;
    }
    if (access_token && refresh_token) {
      (async () => {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        history.replaceState(null, "", window.location.pathname); // clean hash to avoid loops
        if (!error) router.replace("/dashboard");
        else setMsg(error.message);
      })();
    }
  }, [supabase, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/login",
      },
    });
    setSending(false);
    setMsg(error ? error.message : "Check your email for the magic link.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-slate-700">We’ll email you a magic link.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" autoComplete="off">
          <input
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
          <button
            type="submit"
            disabled={sending || !email}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-slate-700">{msg}</p>}
        <p className="mt-10 text-xs text-slate-500">© {String(new Date().getFullYear())} Aligned</p>
      </div>
    </main>
  );
}
