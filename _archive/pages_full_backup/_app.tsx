// /pages/_app.tsx
import type { AppProps } from "next/app";
import { useState } from "react";
import { SessionContextProvider, createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import "../styles/globals.css"; // keep/remove based on your project

export default function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={(pageProps as any)?.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

