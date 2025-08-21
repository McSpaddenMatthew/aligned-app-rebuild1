// /pages/login.tsx
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { getSupabaseBrowser } from "../lib/supabase-browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // show ?error=... from callback if present
  useEffect(() => {
    if (typeof router.query.error === "string") setError(router.query.error);
  }, [router.query.error]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowser();

    // 🔒 Hardcode your domain (use the exact preview or prod you are testing)
    // Example for your app:
    const redirectBase = "https://alignedapp.vercel.app"; 
    // If testing a preview, replace above with: "https://aligned-app-rebuild1.vercel.app"

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectBase}/auth/confirm`, // bridge handles hash links
      },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Check your email</h1>
        <p>Click the magic link to finish signing in.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Sign in</h1>
      <p style={{ opacity: 0.7, marginBottom: 16 }}>
        We’ll email you a one-time magic link.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white"
        >
          Send magic link
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            borderRadius: 8,
          }}
        >
          <strong>Sign-in error:</strong>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
            {error}
          </div>
        </div>
      )}
    </main>
  );
}



