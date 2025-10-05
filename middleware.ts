cat > middleware.ts <<'TS'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const res = NextResponse.next();

  // --- NEW: If Supabase sent us back with ?code= anywhere (/, /login, etc.),
  // bounce to our dedicated callback to exchange the session.
  const code = url.searchParams.get("code");
  if (code && !url.pathname.startsWith("/auth/callback")) {
    const callbackUrl = new URL("/auth/callback", req.url);
    callbackUrl.searchParams.set("code", code);

    // preserve redirectTo if present; otherwise default to /dashboard
    const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
    callbackUrl.searchParams.set("redirectTo", redirectTo);

    return NextResponse.redirect(callbackUrl);
  }

  // Standard Supabase SSR client on the edge
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

  // Refresh session (prevents false-logged-out state)
  await supabase.auth.getUser();

  const pathname = url.pathname;
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth");
  const isPublic =
    pathname === "/" ||
    isAuthPage ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/_next");

  if (isPublic) return res;

  // Protect these routes
  const protectedPrefixes = ["/dashboard", "/summaries"];
  const requiresAuth = protectedPrefixes.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!requiresAuth) return res;

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api|assets|favicon.ico|robots.txt|sitemap.xml).*)"],
};
TS
