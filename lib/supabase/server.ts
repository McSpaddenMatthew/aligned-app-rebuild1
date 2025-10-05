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
        set() { /* handled via middleware */ },
        remove() { /* handled via middleware */ },
      },
      global: {
        headers: {
          "X-Forwarded-Host": headers().get("host") ?? "",
          "X-Forwarded-Proto": headers().get("x-forwarded-proto") ?? "",
        },
      },
    }
  );
}
