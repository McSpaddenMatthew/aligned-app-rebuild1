// pages/login.tsx
import React, { useState, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error(error);
        setStatus("error");
        setMessage(error.message || "Something went wrong sending the link.");
        return;
      }

      setStatus("sent");
      setMessage(
        "Magic link sent. Check your inbox and open the email on this device."
      );
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage("Unexpected error sending magic link.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 16,
          padding: "2rem 2.25rem",
          boxShadow: "0 20px 40px rgba(15,23,42,0.35)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Sign in to Aligned
        </h1>
        <p style={{ color: "#4b5563", fontSize: 14, marginBottom: 24 }}>
          We’ll send a secure magic link to your work email. No passwords.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{ display: "block", fontSize: 14, fontWeight: 500 }}
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              marginTop: 8,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            disabled={status === "loading" || email.length === 0}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: 15,
              cursor:
                status === "loading" || email.length === 0
                  ? "not-allowed"
                  : "pointer",
              background:
                status === "loading" || email.length === 0
                  ? "#9ca3af"
                  : "#2563eb",
              color: "white",
            }}
          >
            {status === "loading" ? "Sending magic link…" : "Send magic link"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: 16,
              fontSize: 14,
              color: status === "error" ? "#b91c1c" : "#065f46",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          Built for recruiters. Trusted by hiring managers.
        </p>
      </div>
    </main>
  );
}
