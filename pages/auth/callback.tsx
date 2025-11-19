// pages/auth/callback.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // First try implicit flow (#access_token)
        const { error: hashError } = await supabase.auth.getSessionFromUrl({
          storeSession: true,
        });

        if (hashError) {
          // If that fails, try the PKCE/code flow (?code=...)
          const search =
            typeof window !== "undefined" ? window.location.search : "";
          if (search) {
            const { error: codeError } =
              // @ts-ignore – this exists in supabase-js v2
              await (supabase.auth as any).exchangeCodeForSession(search);
            if (codeError) {
              throw codeError;
            }
          } else {
            throw hashError;
          }
        }

        // Once session is stored, send to dashboard
        router.replace("/dashboard");
      } catch (err: any) {
        console.error("Error handling auth callback", err);
        setError(
          "We couldn’t complete your sign-in. Try clicking the magic link again."
        );
      }
    }

    handleCallback();
  }, [router]);

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
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Finishing sign-in…
        </h1>
        <p style={{ fontSize: 14, color: "#4b5563" }}>
          We’re verifying your magic link and loading your dashboard.
        </p>
        {error && (
          <p style={{ marginTop: 16, fontSize: 14, color: "#b91c1c" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
