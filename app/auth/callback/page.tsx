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
    async function finishSignIn() {
      // Handle magic links that put tokens in the URL hash:
      // e.g. #access_token=...&refresh_token=...&type=magiclink
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      try {
        if (accessToken && refreshToken) {
          // Store session in Supabase client (local storage)
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          router.replace("/dashboard");
          return;
        }

        // Fallback: if no tokens in hash, just send back to login
        router.replace("/login");
      } catch (error) {
        console.error("Error finishing sign in:", error);
        router.replace("/login?error=callback");
      }
    }

    finishSignIn();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-2xl bg-white shadow-md border border-slate-200 px-8 py-10 text-center">
        <p className="text-sm text-slate-700">
          Finishing sign-in… you&apos;ll be redirected in a moment.
        </p>
      </div>
    </main>
  );
}
