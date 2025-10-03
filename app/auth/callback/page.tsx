"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const supabase = createClientComponentClient();

        // Exchange the code in the URL for a Supabase session
        const { error } = await supabase.auth.exchangeCodeForSession();

        if (error) {
          console.error("Auth callback error:", error.message);
          router.replace("/login"); // back to login on failure
        } else {
          router.replace("/summaries/new"); // success → send to Build Summary page
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium">Finishing login…</p>
    </main>
  );
}
