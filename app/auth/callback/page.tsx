"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleSession() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );

      try {
        // Exchange the code in the callback URL for a Supabase session
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) throw error;

        // After session is stored, send them to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Error handling auth callback:", error);
        router.push("/login");
      }
    }

    handleSession();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Signing you in...</p>
    </main>
  );
}
