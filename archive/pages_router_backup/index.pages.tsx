// pages/index.tsx
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });

function getHashParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  const out: Record<string, string> = {};
  for (const part of raw.split("&")) {
    const [k, v] = part.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return out;
}

export default function Home() {
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    (async () => {
      // 1) If returned with ?code=... -> exchange for a session
      const code = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("code")
        : null;
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        history.replaceState(null, "", window.location.pathname); // clean URL
        if (!error) {
          router.replace("/dashboard");
          return;
        }
      }

      // 2) If returned with #access_token=... -> setSession
      const { access_token, refresh_token } = getHashParams();
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        history.replaceState(null, "", window.location.pathname); // clean URL
        router.replace("/dashboard");
        return;
      }

      // 3) Otherwise, just check session to show the right link
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setLoading(false);
    })();
  }, [supabase, router]);

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to Aligned</h1>
        <p className="text-gray-600">Please sign in to access your dashboard.</p>
        {hasSession ? (
          <Link href="/dashboard" className="px-4 py-2 bg-black text-white rounded">Go to Dashboard</Link>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-black text-white rounded">Sign in</Link>
        )}
        <p className="mt-8 text-xs text-slate-500">© {String(new Date().getFullYear())} Aligned</p>
      </div>
    </main>
  );
}
