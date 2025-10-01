"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If magic link returned with hash tokens, let supabase-js process it.
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      setBusy(true);
      // getSession() will parse the hash and persist the session in local storage
      supabase.auth.getSession().then(() => {
        // Clean the hash from the URL and continue
        router.replace("/summaries/new");
      });
    }
  }, [router]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Aligned</h1>
      {busy ? (
        <p>Signing you in…</p>
      ) : (
        <a href="/login" className="inline-block border rounded px-4 py-2">
          Login
        </a>
      )}
    </main>
  );
}


