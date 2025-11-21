import { useState, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setError("Something went wrong sending your magic link.");
      return;
    }

    setSent(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "32px 40px",
          borderRadius: "16px",
          boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
          maxWidth: "420px",
          width: "100%",
          textAlign: "left",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Sign in to Aligned
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
          Use your work email to get a secure magic link.
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "14px", marginBottom: "6px" }}
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            />
            {error && (
              <p
                style={{
                  color: "#b91c1c",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#0f172a",
                color: "white",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.8 : 1,
                marginTop: "4px",
              }}
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        ) : (
          <p style={{ fontSize: "14px", color: "#0f172a" }}>
            Magic link sent. Check your inbox and open the link on this device.
          </p>
        )}
      </div>
    </div>
  );
}
