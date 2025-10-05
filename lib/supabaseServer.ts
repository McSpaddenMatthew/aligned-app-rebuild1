// lib/supabase/server.ts
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Next.js server cookies are immutable in server actions—middleware handles refresh
        },
        remove() {
          // handled in middleware if needed
        },
      },
      global: {
        headers: {
          // forward host for local/prod consistency
          "X-Forwarded-Host": headers().get("host") ?? "",
          "X-Forwarded-Proto": headers().get("x-forwarded-proto") ?? "",
        },
      },
    }
  );
}


