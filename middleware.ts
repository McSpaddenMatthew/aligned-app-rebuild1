import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // 1) If any page has ?code=, forward to /auth/callback so we exchange it.
  const code = url.searchParams.get("code");
  if (code && !url.pathname.startsWith("/auth/callback")) {
    const callbackUrl = new URL("/auth/callback", req.url);
    callbackUrl.searchParams.set("code", code);
    const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
    callbackUrl.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(callbackUrl);
  }

  // Prepare a response we can modify cookies on
  const res = NextResponse.next();

  // 2) Create Supabase client that can READ/WRITE cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 3) Refresh/propagate the session cookies so logged-in users stay logged in
  await supabase.auth.getUser();

  // 4) Gate protected routes
  const protectedPrefixes = ["/dashboard", "/summaries"];
  const pathname = url.pathname;
  const requiresAuth = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!requiresAuth) return res;

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// IMPORTANT: Run middleware on ALL app routes (incl. "/"), excluding assets/api.
export const config = {
  matcher: ["/((?!_next|.*\\..*|api|assets|favicon.ico|robots.txt|sitemap.xml).*)"],
};
