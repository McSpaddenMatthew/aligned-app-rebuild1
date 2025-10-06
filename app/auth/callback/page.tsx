"use client";
import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
export const dynamic = "force-dynamic";

function Inner() {
  const router = useRouter();
  const qp = useSearchParams();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    (async () => {
      const code = qp.get("code");
      const redirectTo = qp.get("redirectTo") || "/dashboard";
      if (!code) return router.replace("/login?error=no_code");

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setMsg("Sign-in failed. Redirecting…");
        router.replace(`/login?error=exchange_failed&reason=${encodeURIComponent(error.message)}`);
        return;
      }
      router.replace(redirectTo);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="rounded-xl border bg-white px-6 py-4 shadow-sm text-slate-700">{msg}</div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen grid place-items-center">Loading…</main>}>
      <Inner />
    </Suspense>
  );
}
