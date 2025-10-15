import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(req: NextRequest) {
  const u = req.nextUrl;
  const isPublic =
    u.pathname === "/" ||
    u.pathname.startsWith("/login") ||
    u.pathname.startsWith("/auth/callback") ||
    u.pathname.startsWith("/_next") ||
    u.pathname === "/favicon.ico";
  if (isPublic) return NextResponse.next();
  const hasSession = req.cookies.get("sb-access-token") || req.cookies.get("sb-session");
  if (!hasSession) {
    const login = new URL("/login", u);
    login.searchParams.set("next", u.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
