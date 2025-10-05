import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => request.cookies.get(key)?.value,
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("redirectTo", pathname);

  // redirect unauthenticated users away from dashboard routes
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(redirectUrl);
  }

  // handle magic link callbacks with ?code=
  if (request.nextUrl.searchParams.get("code")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/callback"],
};

