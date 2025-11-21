// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Try to read tokens from the hash fragment sent by Supabase
        const hash = window.location.hash?.substring(1); // drop the #
        const hashParams = new URLSearchParams(hash);

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set the Supabase session from the magic link tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session from hash:", error);
            setMessage("Could not complete sign-in. Please try again.");
            // Give the user a path back
            setTimeout(() => router.replace("/login"), 2500);
            return;
          }

          // Session established — send them to the dashboard
          router.replace("/dashboard");
          return;
        }

        // 2. Fallback: if there are no hash tokens, just check if a session already exists
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setMessage("Could not complete sign-in. Please try again.");
          setTimeout(() => router.replace("/login"), 2500);
          return;
        }

        const session = data.session;
        if (session?.user) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error(err);
        setMessage("Something went wrong. Redirecting you to login…");
        setTimeout(() => router.replace("/login"), 2500);
      }
    };

    handleCallback();
  }, [router]);

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
          padding: "2rem 2.5rem",
          borderRadius: "1rem",
          boxShadow: "0 20px 45px rgba(15,23,42,0.15)",
          textAlign: "center",
          maxWidth: "420px",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            marginBottom: "0.75rem",
          }}
        >
          Signing you in…
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#6b7280" }}>{message}</p>
      </div>
    </main>
  );
}
