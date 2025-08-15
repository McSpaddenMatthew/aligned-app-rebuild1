import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client using public env vars
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Finishing sign-in…");

  useEffect(() => {
    async function finishSignIn() {
      // First, try to get the current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus("Signed in. Redirecting…");
        router.replace("/dashboard");
      } else {
        // If no session, try exchanging the code in the URL for a session
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error("Auth error:", error.message);
          setStatus("Sign-in failed. Please try the link again.");
        } else {
          setStatus("Signed in. Redirecting…");
          router.replace("/dashboard");
        }
      }
    }

    finishSignIn();
  }, [router]);

  return (
    <main style={{
      display: "grid",
      placeItems: "center",
      minHeight: "60vh",
      fontFamily: "ui-sans-serif, system-ui"
    }}>
      <div style={{
        padding: "1rem 1.25rem",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        maxWidth: 320,
        textAlign: "center"
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Aligned</h1>
        <p style={{ marginTop: 8 }}>{status}</p>
      </div>
    </main>
  );
}
