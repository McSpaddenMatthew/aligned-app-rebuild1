"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const supabase = supabaseBrowser();

  useEffect(() => {
    (async () => {
      const code = sp.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (e) {
          console.error("Exchange code error:", e);
        } finally {
          router.replace(next);
        }
        return;
      }

      if (typeof window !== "undefined" && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");

        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token });
          } catch (e) {
            console.error("Set session error:", e);
          } finally {
            const cleanUrl = window.location.pathname + (next ? `?next=${encodeURIComponent(next)}` : "");
            window.history.replaceState({}, "", cleanUrl);
            router.replace(next);
          }
          return;
        }
      }

      router.replace("/login" + (next ? `?next=${encodeURIComponent(next)}` : ""));
    })();
  }, [router, sp, next, supabase]);

  return (
    <main className="max-w-md">
      <div className="rounded-2xl border p-6 shadow-sm">
        <p className="text-sm text-slate-600">Signing you in…</p>
      </div>
    </main>
  );
}
