"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleSession() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase environment variables");
        router.push("/login");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      try {
        // Exchange the auth code in the callback URL for a Supabase session
        // and store it in the browser. This is the v2 equivalent of the
        // deprecated `getSessionFromUrl` helper.
        const code = new URL(window.location.href).searchParams.get("code");

        if (!code) throw new Error("Missing auth code");

        const { error } = await supabase.auth.exchangeCodeForSession(code);

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
