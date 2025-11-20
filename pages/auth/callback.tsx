import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      try {
        // Handles both code query param and hash fragment access_token
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (err) {
        console.error("Error exchanging code for session", err);
      } finally {
        router.replace("/dashboard");
      }
    }

    // Only run in browser when router is ready
    if (router.isReady) {
      handleAuth();
    }
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "white",
      }}
    >
      <p style={{ fontSize: "16px" }}>Finishing sign-in…</p>
    </div>
  );
}
