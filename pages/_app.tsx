// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Handle magic-link hash tokens anywhere (e.g., "/#access_token=...")
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const access_token = params.get("access_token") || "";
        const refresh_token = params.get("refresh_token") || "";

        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token });
          } catch (e) {
            console.error("Global setSession failed", e);
          }

          // Prefer ?next= in current URL; otherwise default
          const search = new URLSearchParams(window.location.search);
          const next = search.get("next") || "/summaries/new";

          if (!cancelled) router.replace(next);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <Component {...pageProps} />;
}

