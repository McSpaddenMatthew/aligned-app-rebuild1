import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

// Public Supabase client (anon+url from env)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Set this to your deployed domain in production.
// For local dev, it will fallback to your current origin.
const CALLBACK_URL =
  (typeof window !== "undefined" ? window.location.origin : "") + "/auth/callback";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // If already signed-in, go straight to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!email.trim()) {
      setErr("Please enter your email.");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: CALLBACK_URL, // critical: /auth/callback
        },
      });

      if (error) throw error;
      setMsg("Magic link sent! Check your inbox and click the link within 1 minute.");
    } catch (e: any) {
      setErr(e.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      fontFamily: "ui-sans-serif, system-ui",
      padding: 16
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20
      }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Aligned</h1>
        <p style={{ marginTop: 0, color: "#6b7280" }}>
          Sign in with a magic link.
        </p>

        <form onSubmit={sendMagicLink} style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              cursor: "pointer"
            }}
          >
            {sending ? "Sending…" : "Send Magic Link"}
          </button>

          {msg && <div style={{ color: "#065f46" }}>{msg}</div>}
          {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
        </form>

        <hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} />

        <button
          onClick={async () => {
            // Optional quick check: if already authed, go dashboard
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.push("/dashboard");
            else setErr("You’re not signed in yet. Use the magic link above.");
          }}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer"
          }}
        >
          Go to Dashboard
        </button>

        <p style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
          Having trouble? Ensure <code>/auth/callback</code> is in your Supabase Redirect URLs.
        </p>
      </div>
    </main>
  );
}


