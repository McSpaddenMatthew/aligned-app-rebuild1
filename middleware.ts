import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAuthCallback = url.pathname.startsWith("/auth/callback");
  const isPublic =
    isAuthCallback ||
    url.pathname.startsWith("/login") ||
    url.pathname === "/" ||
    url.pathname.startsWith("/_next") ||
    url.pathname === "/favicon.ico";

  if (isPublic) return NextResponse.next();

  const hasSession =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb-refresh-token") ||
    req.cookies.get("sb-session");

  if (!hasSession) {
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
