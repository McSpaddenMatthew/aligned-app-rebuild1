"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err: any) {
      setError(err?.message || "Unable to send Magic Link");
      setStatus("idle");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "radial-gradient(circle at top, rgba(52,211,153,0.2), transparent)",
      }}
    >
      <div className="card" style={{ maxWidth: 480, width: "100%" }}>
        <Link href="/" className="text-dim" style={{ textDecoration: "none" }}>
          ← Back to site
        </Link>
        <h1 style={{ margin: "16px 0 8px" }}>Access Aligned</h1>
        <p className="text-dim" style={{ marginBottom: 24 }}>
          We email you a secure Magic Link. Use the same email each time to see your private candidate workspace.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@fund.com"
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.2)",
                color: "var(--text)",
              }}
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              borderRadius: 999,
              border: "none",
              padding: "14px 20px",
              fontWeight: 600,
              letterSpacing: 0.08,
              textTransform: "uppercase",
              background: "var(--accent-strong)",
              color: "#041013",
              cursor: "pointer",
            }}
          >
            {status === "sending" ? "Sending…" : status === "sent" ? "Check your inbox" : "Send Magic Link"}
          </button>
          {error && (
            <p style={{ color: "#f87171", margin: 0 }}>{error}</p>
          )}
          {status === "sent" && !error && (
            <p className="text-dim" style={{ margin: 0 }}>
              Magic Link sent. Look for an email from Supabase and open it on this device to jump straight into your dashboard.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
