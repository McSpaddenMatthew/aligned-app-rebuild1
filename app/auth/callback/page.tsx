"use client";

import { Suspense, useEffect } from "react";

// Avoid static pre-render; this page should run on the client only
export const dynamic = "force-dynamic";
export const revalidate = 0;

function CallbackInner() {
  // No logic needed here — AuthListener handles ?code and #access_token
  useEffect(() => {}, []);
  return <p>Finishing sign-in…</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p>Finishing sign-in…</p>}>
      <CallbackInner />
    </Suspense>
  );
}
