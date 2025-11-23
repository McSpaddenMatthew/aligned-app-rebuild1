"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Handles magic-link / OTP / PKCE callbacks.
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error || !data.session) {
          console.error("Error exchanging code for session:", error);
          router.replace("/login?error=callback");
          return;
        }

        // Optional: honor ?next=/some/path
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/dashboard";

        router.replace(next);
      } catch (err) {
        console.error("Unexpected auth callback error:", err);
        router.replace("/login?error=callback");
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Signing you in…</p>
    </main>
  );
}
