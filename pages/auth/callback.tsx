// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

function getHashParams() {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.substring(1)
    : window.location.hash;

  const params = new URLSearchParams(hash);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    type: params.get("type"),
  };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleMagicLink() {
      const { access_token, refresh_token } = getHashParams();

      if (!access_token || !refresh_token) {
        setError("Missing auth tokens in callback URL.");
        router.replace("/login");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error("Error setting Supabase session:", error.message);
        setError(error.message);
        router.replace("/login");
        return;
      }

      // Clean up the hash so tokens aren't in the address bar
      window.history.replaceState({}, "", "/dashboard");
      router.replace("/dashboard");
    }

    handleMagicLink();
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 120 }}>
      <div style={{ border: "1px solid #ccc", padding: 40, borderRadius: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, textAlign: "center" }}>
          Finishing sign-in…
        </h1>
        <p style={{ textAlign: "center", marginTop: 8 }}>
          Please wait while we complete your login.
        </p>
        {error && (
          <p
            style={{
              marginTop: 16,
              color: "red",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
