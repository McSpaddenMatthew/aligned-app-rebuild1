"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleSession() {
      if (typeof window === "undefined") return;

      const searchParams = new URLSearchParams(window.location.search);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase environment variables are missing.");
        router.push("/login");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const code = searchParams.get("code");
      const redirectPath = searchParams.get("next") ?? "/dashboard";

      if (!code) {
        router.push("/login");
        return;
      }

      try {
        // Exchange the OAuth code for a Supabase session and persist it
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) throw error;

        // After session is stored, send them to dashboard
        router.push(redirectPath);
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
