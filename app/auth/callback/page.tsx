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

        const { error } = await supabase.auth.exchangeCodeForSession();

        if (error) {
          console.error("Auth callback error:", error.message);
          router.replace("/login");
        } else {
          router.replace("/summaries/new");
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

