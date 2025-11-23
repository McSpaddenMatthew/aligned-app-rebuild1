'use client';

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";

const SITE_COPY = {
  titleBadge: "HIRING MANAGERS WANT PROOF, NOT PITCHES",
  heroTitle: "Hiring decisions need evidence.\nRecruiters need trust.",
  heroSub:
    "Aligned turns messy intake notes and resumes into decision-ready candidate reports that speak your hiring manager’s language.",
  cta: "Build my first summary →",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Magic link request failed");
      }

      setStatus("success");
      setMessage(
        "Check your inbox. If the email is valid, we’ve sent you a magic link."
      );
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Error sending magic link. Please try again.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #111827, #020617)",
        color: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: "3rem",
          alignItems: "center",
        }}
      >
        {/* LEFT – HERO */}
        <section>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148, 163, 184, 0.6)",
              background: "rgba(15,23,42,0.8)",
              marginBottom: 16,
              fontSize: 12,
              letterSpacing: 0.08,
              textTransform: "uppercase",
              color: "#e5e7eb",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                backgroundColor: "#f97316",
              }}
            />
            {SITE_COPY.titleBadge}
          </div>

          <h1
            style={{
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 700,
              marginBottom: 16,
              whiteSpace: "pre-line",
            }}
          >
            {SITE_COPY.heroTitle}
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              color: "#cbd5f5",
              maxWidth: 520,
              marginBottom: 24,
            }}
          >
            {SITE_COPY.heroSub}
          </p>

          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.85rem 1.6rem",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#f97316",
              color: "#020617",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 15,
              boxShadow: "0 18px 45px rgba(248, 113, 113, 0.25)",
            }}
            onClick={() => {
              const input = document.getElementById("work-email");
              if (input) input.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            {SITE_COPY.cta}
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              marginTop: 32,
            }}
          >
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>For recruiters</h3>
              <p style={cardTextStyle}>From ignored to indispensable.</p>
            </div>
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>For hiring managers</h3>
              <p style={cardTextStyle}>Your words → our reports.</p>
            </div>
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>For PE & exec teams</h3>
              <p style={cardTextStyle}>Fewer mis-hires, faster.</p>
            </div>
          </div>

          <p
            style={{
              marginTop: 32,
              fontSize: 13,
              color: "#9ca3af",
            }}
          >
            From intake call → decision-ready report. Today: capture candidates and
            test the flow. Next: we plug in the AI summary engine and HM-share links.
          </p>
        </section>

        {/* RIGHT – LOGIN CARD */}
        <section
          style={{
            borderRadius: 24,
            padding: "24px 24px 28px",
            background:
              "radial-gradient(circle at top, rgba(15,23,42,1), rgba(15,23,42,0.9))",
            border: "1px solid rgba(148,163,184,0.5)",
            boxShadow: "0 20px 60px rgba(15,23,42,0.75)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>
                Log in or sign up
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#9ca3af",
                }}
              >
                Use your work email. We’ll send you a magic link — no passwords to
                remember.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <label
              htmlFor="work-email"
              style={{
                display: "block",
                fontSize: 13,
                color: "#e5e7eb",
                marginBottom: 6,
              }}
            >
              Work email
            </label>
            <input
              id="work-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@firm.com"
              style={{
                width: "100%",
                padding: "0.7rem 0.9rem",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.9)",
                backgroundColor: "#020617",
                color: "#f9fafb",
                fontSize: 14,
                outline: "none",
                marginBottom: 14,
              }}
            />

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: 999,
                border: "none",
                backgroundColor: status === "loading" ? "#fb923c" : "#f97316",
                color: "#020617",
                fontWeight: 600,
                fontSize: 15,
                cursor: status === "loading" ? "wait" : "pointer",
              }}
            >
              {status === "loading" ? "Sending magic link..." : "Send magic link"}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: status === "error" ? "#fecaca" : "#a7f3d0",
              }}
            >
              {message}
            </p>
          )}

          <p
            style={{
              marginTop: 18,
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            No installs. No setup. Just log in with email.
          </p>
        </section>
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(55,65,81,0.9)",
  background:
    "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,23,42,0.98))",
};

const cardTitleStyle: CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.08,
  color: "#e5e7eb",
  marginBottom: 4,
};

const cardTextStyle: CSSProperties = {
  fontSize: 13,
  color: "#9ca3af",
};
