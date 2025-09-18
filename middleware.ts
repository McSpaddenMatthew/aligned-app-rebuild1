// middleware.ts (at project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  );

  // When /auth/callback is hit via magic link, this exchanges the code for a session and sets cookies
  await supabase.auth.getSession();

  return res;
}

export const config = {
  // run on all routes except Next static assets and favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
