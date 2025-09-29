import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Handle magic link return for both patterns:
  // 1) /login?code=xyz
  // 2) /login#access_token=...
  useEffect(() => {
    const run = async () => {
      // Hash flow (#access_token=...)
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (!error && data?.session) return router.replace("/summaries/new");
      }

      // Query flow (?code=...)
      if (router.isReady && router.query.code) {
        const code = String(router.query.code);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.session) return router.replace("/summaries/new");
      }
    };
    run();
  }, [router]);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setSending(false);
    setMessage(error ? error.message : "Check your email for a magic link.");
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold mb-2">Log in</h1>
      <p className="text-slate-600 mb-6">We’ll email you a magic link.</p>
      <form onSubmit={sendMagicLink} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border px-4 py-3"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl px-4 py-3 bg-black text-white"
        >
          {sending ? "Sending…" : "Send magic link"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  );
}

