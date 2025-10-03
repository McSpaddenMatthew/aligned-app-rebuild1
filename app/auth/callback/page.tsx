"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase looks for tokens in the URL hash (#access_token=…)
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error.message);
        router.push("/login");
        return;
      }

      if (data?.session) {
        // ✅ successful login → send them to summaries
        router.push("/summaries/new");
      } else {
        // no session? back to login
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Logging you in…</h2>
    </div>
  );
}


