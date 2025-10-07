"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function AuthListener({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle #access_token=...&refresh_token=...
    if (window.location.hash.includes("access_token")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          window.history.replaceState({}, document.title, "/dashboard");
          router.replace("/dashboard");
        });
      }
      return;
    }

    // Handle ?code= redirect
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.history.replaceState({}, document.title, "/dashboard");
        router.replace("/dashboard");
      });
    }
  }, [router]);

  return <>{children}</>;
}
