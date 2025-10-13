import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  // Server-side supabase client that persists auth via cookies
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name, options) => {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  // If we're using the "code" flow, finalize the session
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // ignore; we'll still try to move the user forward
    }
  }

  // For hash-based magic links (#access_token), this route will just redirect;
  // the client side can set the session from the hash on /login or /dashboard.
  return NextResponse.redirect(new URL(next, request.url));
}
