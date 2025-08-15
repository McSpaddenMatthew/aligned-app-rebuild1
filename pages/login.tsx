// pages/login.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

// Self-contained Supabase browser client (no local lib required)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // If already logged in, bounce away
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace("/"); // or "/dashboard"
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function sendLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return setMsg("Enter your email.");

    setBusy(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setBusy(false);
    if (error) setMsg(error.message);
    else setMsg("Check your email for the login link.");
  }

  return (
    <>
      <Head>
        <title>Login | Aligned</title>
      </Head>

      <main style={{ maxWidth: 440, margin: "64px auto", padding: 24 }}>
        <h1 style={{ marginBottom: 12 }}>Log in</h1>

        <form onSubmit={sendLink}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginTop: 8,
              marginBottom: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: 0,
              cursor: "pointer",
            }}
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </main>
    </>
  );
}

