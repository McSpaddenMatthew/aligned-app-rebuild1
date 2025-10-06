cat > middleware.ts <<'TS'
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");

  const res = NextResponse.next();
  res.headers.set("x-mw", code ? "has-code" : "no-code");

  if (code) {
    const redirectTo = url.searchParams.get("redirectTo") ?? "/dashboard";
    const dest = new URL("/auth/callback", req.url);
    dest.searchParams.set("code", code);
    dest.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(dest);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
TS

