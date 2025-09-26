import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Read ?next= from query
  const nextParam = useMemo(() => {
    const raw = router.query.next;
    return typeof raw === "string" && raw.trim() ? raw : "/summaries/new";
  }, [router.query.next]);

  // Handle returning from magic link (both ?code= and #access_token)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Case 1: hash tokens (/#access_token=...)
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const access_token = params.get("access_token") || "";
        const refresh_token = params.get("refresh_token") || "";

        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token });
          } catch (e) {
            console.error("setSession failed", e);
          }
          if (!cancelled) {
            router.replace(nextParam || "/summaries/new");
          }
          return;
        }
      }

      // Case 2: PKCE (?code=)
      const code = typeof router.query.code === "string" ? router.query.code : "";
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } catch (err: any) {
          if (!cancelled) {
            console.error(err?.message || err);
            setStatus("error");
            setErrorMsg(err?.message || "Login failed while exchanging code.");
          }
          return;
        }
      }

      // If already signed in, go to next
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        router.replace(nextParam || "/summaries/new");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, nextParam]);

  // Send magic link
  const sendMagicLink = useCallback(async () => {
    try {
      setStatus("sending");
      setErrorMsg("");
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const redirect = `${origin}/login${
        nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""
      }`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirect,
        },
      });

      if (error) throw error;
      setStatus("sent");
    } catch (err: any) {
      console.error(err?.message || err);
      setStatus("error");
      setErrorMsg(err?.message || "Could not send the magic link. Please try again.");
    }
  }, [email, nextParam]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      sendMagicLink();
    },
    [email, sendMagicLink]
  );

  return (
    <>
      <Head>
        <title>Log in • Aligned</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0A0A0A",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <header style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Welcome back</h1>
            <p style={{ margin: "8px 0 0 0", color: "#475569" }}>
              Sign in with a magic link. No password needed.
            </p>
          </header>

          {status === "sent" ? (
            <div>
              <p style={{ marginTop: 0 }}>
                Check your email for a sign-in link. After you click it, we’ll send you to{" "}
                <code>{nextParam}</code>.
              </p>
              <button
                onClick={() => setStatus("idle")}
                style={secondaryBtnStyle}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                autoFocus
              />

              {status === "error" && (
                <p style={{ color: "#B91C1C", marginTop: 8 }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  ...primaryBtnStyle,
                  opacity: status === "sending" ? 0.7 : 1,
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                }}
              >
                {status === "sending" ? "Sending link..." : "Send magic link"}
              </button>

              <p style={{ marginTop: 10, fontSize: 12, color: "#64748B" }}>
                You’ll return to <code>{nextParam}</code> after logging in.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

/** --- inline styles --- */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "1px solid #E2E8F0",
  padding: "0 12px",
  outline: "none",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 46,
  marginTop: 14,
  borderRadius: 12,
  border: "none",
  fontWeight: 700,
  fontSize: 16,
  background: "#FF6B35",
  color: "#FFFFFF",
};

const secondaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  marginTop: 8,
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  background: "#FFFFFF",
  color: "#0A0A0A",
  fontWeight: 600,
};

