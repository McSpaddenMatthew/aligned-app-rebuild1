import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  if (!code) return NextResponse.redirect(new URL("/login?error=no_code", request.url));

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const u = new URL("/login", request.url);
    u.searchParams.set("error", "exchange_failed");
    u.searchParams.set("reason", error.message || "unknown");
    return NextResponse.redirect(u);
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
