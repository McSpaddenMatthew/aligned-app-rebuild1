// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const hash = window.location.hash;
    const accessToken = new URLSearchParams(hash.replace("#", "")).get(
      "access_token"
    );
    const refreshToken = new URLSearchParams(hash.replace("#", "")).get(
      "refresh_token"
    );

    async function handleAuth() {
      // If Supabase is using PKCE (?code=...), this will be handled automatically
      // by auth-helpers; we mainly need to ensure we land on /dashboard.
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      router.replace("/dashboard");
    }

    handleAuth();
  }, [router, searchParams, supabase]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <p>Finishing sign-in…</p>
    </main>
  );
}
