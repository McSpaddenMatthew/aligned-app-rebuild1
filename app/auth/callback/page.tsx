"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const redirectTo = params.get("redirectTo") || "/dashboard";
  const supabase = supabaseBrowser();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // 1) If hash tokens exist (older/alt flow), setSession() first and bail.
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.slice(1);
        const qs = new URLSearchParams(hash);
        const access_token = qs.get("access_token");
        const refresh_token = qs.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          // Clean the hash so it won't re-trigger
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, "", cleanUrl);
          if (error) {
            router.replace(`/login?error=exchange_failed&reason=${encodeURIComponent(error.message)}`);
            return;
          }
          if (!cancelled) {
            router.replace(redirectTo);
            return;
          }
        }
      }

      // 2) Otherwise do PKCE code exchange
      if (!code) {
        router.replace("/login?error=no_code");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        router.replace(`/login?error=exchange_failed&reason=${encodeURIComponent(error.message)}`);
        return;
      }

      if (!cancelled) router.replace(redirectTo);
    }

    void run();
    return () => { cancelled = true; };
  }, [code, redirectTo, router, supabase]);

  return (
    <main className="mx-auto max-w-md p-6">
      <p>Finishing sign-in…</p>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md p-6">
          <p>Loading…</p>
        </main>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
