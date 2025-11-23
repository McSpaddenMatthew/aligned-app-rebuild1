"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleSession() {
      try {
        if (!searchParams) {
          throw new Error("Search params not available");
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase environment variables are missing");
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const code = searchParams.get("code");

        if (!code) {
          throw new Error("No auth code found in URL");
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        // After session is stored, send them to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Error handling auth callback:", error);
        router.push("/login");
      }
    }

    handleSession();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Signing you in...</p>
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Signing you in...</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
