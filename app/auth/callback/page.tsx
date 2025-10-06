"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get("code");
      const redirectTo = searchParams.get("redirectTo") || "/dashboard";

      if (!code) {
        router.replace("/login?error=no_code");
        return;
      }

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setMsg("Sign-in failed. Redirecting to login…");
        router.replace(`/login?error=exchange_failed&reason=${encodeURIComponent(error.message)}`);
        return;
      }

      router.replace(redirectTo);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="rounded-xl border bg-white px-6 py-4 shadow-sm text-slate-700">
        {msg}
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}>
      <CallbackInner />
    </Suspense>
  );
}
