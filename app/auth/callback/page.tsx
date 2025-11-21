"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleSession() {
      try {
        // This reads the token from the URL hash and stores the session
        await supabase.auth.getSessionFromUrl({ storeSession: true });

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
