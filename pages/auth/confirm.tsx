// /pages/auth/confirm.tsx
import { useEffect } from "react";
import type { GetServerSideProps } from "next";

/**
 * Bridge for hash-based magic links (/#access_token=...).
 * Reads the hash in the browser, then forwards to /api/auth/callback
 * so the server can set the Supabase auth cookie.
 */
export default function Confirm() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash; // e.g. "#access_token=...&refresh_token=...&type=..."
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

/** Force SSR to avoid static pre-render of this client-only bridge page. */
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

