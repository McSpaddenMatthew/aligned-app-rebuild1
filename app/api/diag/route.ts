import { NextResponse } from "next/server";
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const projectRef = url ? new URL(url).hostname.split(".")[0] : null;
  return NextResponse.json({ supabaseUrl: url, supabaseProjectRef: projectRef, hasAnonKey: hasAnon });
}
