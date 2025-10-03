// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Only gate the app areas that need auth
  const protectedPaths = [/^\/summaries(\/.*)?$/, /^\/dashboard(\/.*)?$/];
  const pathname = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => p.test(pathname));
  if (!isProtected) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k) => req.cookies.get(k)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: [
    "/summaries/:path*",
    "/dashboard/:path*",
  ],
};
