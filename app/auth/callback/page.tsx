"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Exchanges ?code=... in the URL for a Supabase session (PKCE flow)
      const supabase = createClientComponentClient();
      const { error } = await supabase.auth.exchangeCodeForSession();

      if (error) {
        console.error("Auth callback error:", error.message);
        router.replace("/login");
        return;
      }

      // Success → send to Build Summary
      router.replace("/summaries/new");
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-sm text-[#475569]">
      Finishing sign-in…
    </main>
  );
}
