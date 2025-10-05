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
      if (!code) {
        router.replace("/login?error=no_code");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        router.replace(
          `/login?error=exchange_failed&reason=${encodeURIComponent(error.message)}`
        );
        return;
      }
      if (!cancelled) router.replace(redirectTo);
    }
    void run();
    return () => {
      cancelled = true;
    };
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
