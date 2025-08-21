// /pages/auth/confirm.tsx
import { useEffect } from "react";

/**
 * Bridge for hash-based magic links (/#access_token=...).
 * Moves the hash into the querystring and forwards to /api/auth/callback
 * so the server can set the Supabase auth cookie.
 */
export default function Confirm() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash; // e.g. "#access_token=...&type=..."
    if (!hash || hash.length < 2) {
      window.location.replace("/login");
      return;
    }

    const qs = hash.slice(1); // drop '#'
    window.location.replace(`/api/auth/callback?${qs}`);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Finishing sign-in…</h1>
      <p>Please wait a moment.</p>
    </main>
  );
}

