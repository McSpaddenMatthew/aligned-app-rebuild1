// pages/login.tsx
import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error(error);
        setError(error.message);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "2.5rem 3rem",
          borderRadius: "1rem",
          boxShadow: "0 20px 45px rgba(15,23,42,0.15)",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            marginBottom: "0.25rem",
            textAlign: "center",
          }}
        >
          Sign in to Aligned
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            textAlign: "center",
            marginBottom: "1.75rem",
          }}
        >
          Use your work email and we’ll send you a secure magic link.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 500,
              marginBottom: "0.35rem",
            }}
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
              width: "100%",
              padding: "0.75rem 0.9rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.95rem",
              marginBottom: "1rem",
            }}
          />

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              width: "100%",
              padding: "0.75rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: status === "sending" ? "default" : "pointer",
              opacity: status === "sending" ? 0.7 : 1,
            }}
          >
            {status === "sending" ? "Sending magic link…" : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#16a34a",
              textAlign: "center",
            }}
          >
            Magic link sent. Check your inbox and open the link on this device.
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#b91c1c",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
