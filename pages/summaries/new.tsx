// pages/summaries/new.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function NewSummaryPage() {
  const router = useRouter();

  // UI state
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // stable path for redirects
  const thisPath = useMemo(() => "/summaries/new", []);

  // Auth gate: if no session, bounce to login with next=
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(thisPath)}`);
        return;
      }

      setUserEmail(data.session.user.email ?? null);
      setAuthChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, thisPath]);

  // Handle generate
  const generate = useCallback(async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const summary = data?.summary ?? "";
      setResult(summary);
    } catch (err: any) {
      setResult(`Error: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [notes]);

  // Cmd/Ctrl + Enter to generate
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === "Enter" && notes.trim() && !loading) {
        e.preventDefault();
        generate();
      }
    },
    [generate, notes, loading]
  );

  // Copy helpers
  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      alert("Copied to clipboard");
    } catch {
      alert("Could not copy. Select the text and copy manually.");
    }
  }, [result]);

  // Logout
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace(`/login?next=${encodeURIComponent(thisPath)}`);
  }, [router, thisPath]);

  if (!authChecked) return null; // brief blank while checking

  return (
    <>
      <Head>
        <title>New Summary • Aligned</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
        {/* Header */}
        <header
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 style={{ color: "#FFFFFF", fontSize: 20, margin: 0 }}>Aligned</h1>
            <a href="/summaries/new" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: 600 }}>
              New Summary
            </a>
            <a href="/" style={{ color: "#FFFFFF", textDecoration: "none" }}>
              Home
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {userEmail && (
              <span style={{ color: "#E2E8F0", fontSize: 14 }}>{userEmail}</span>
            )}
            <button
              onClick={signOut}
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                background: "#0A0A0A",
                color: "#FFFFFF",
                cursor: "pointer",
              }}
              title="Sign out"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main */}
        <main
          style={{
            maxWidth: 1100,
            margin: "32px auto",
            padding: "0 20px",
            display: "grid",
            gap: 20,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {/* Left column: Input */}
          <section
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Paste your notes</h2>
            <p style={{ color: "#475569", marginTop: 6 }}>
              Paste HM priorities + candidate call notes. Press{" "}
              <strong>Cmd/Ctrl + Enter</strong> to generate.
            </p>

            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Example:
- HM: Wants payer data leadership, SQL + Snowflake, VBC experience
- Candidate: Led BI team of 12; SQL/Python; built payer analytics; exec reporting weekly
- Risks: Light on finance partnering; mitigated with project X...
`}
              style={{
                width: "100%",
                height: 320,
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                padding: 12,
                resize: "vertical",
                outline: "none",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                onClick={generate}
                disabled={loading || !notes.trim()}
                style={{
                  flex: "0 0 auto",
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "none",
                  background: "#FF6B35",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  cursor: loading || !notes.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !notes.trim() ? 0.7 : 1,
                }}
              >
                {loading ? "Generating…" : "Generate Summary"}
              </button>

              <button
                onClick={() => setNotes("")}
                disabled={loading || !notes}
                style={{
                  flex: "0 0 auto",
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  fontWeight: 600,
                  cursor: loading || !notes ? "not-allowed" : "pointer",
                  opacity: loading || !notes ? 0.7 : 1,
                }}
              >
                Clear
              </button>
            </div>
          </section>

          {/* Right column: Output */}
          <section
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Summary (copy &amp; paste)</h2>

            <div
              style={{
                whiteSpace: "pre-wrap",
                minHeight: 280,
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: 12,
                fontFamily: "Inter, system-ui, sans-serif",
                background: "#F8FAFC",
              }}
            >
              {result || "Your generated summary will appear here."}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                onClick={copyResult}
                disabled={!result}
                style={{
                  flex: "0 0 auto",
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "none",
                  background: "#0A0A0A",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  cursor: !result ? "not-allowed" : "pointer",
                  opacity: !result ? 0.7 : 1,
                }}
              >
                Copy Summary
              </button>

              <button
                onClick={() => setResult("")}
                disabled={!result}
                style={{
                  flex: "0 0 auto",
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  fontWeight: 600,
                  cursor: !result ? "not-allowed" : "pointer",
                  opacity: !result ? 0.7 : 1,
                }}
              >
                Clear Output
              </button>
            </div>

            <p style={{ color: "#64748B", marginTop: 10, fontSize: 12 }}>
              If you arrive here unauthenticated, you’ll be redirected to login and sent back.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
