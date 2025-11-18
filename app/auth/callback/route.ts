import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function buildHtmlRedirect() {
  return `<!doctype html>
<html lang="en">
  <head><title>Completing sign in...</title></head>
  <body style="font-family: Inter, system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh;">
    <p>Completing sign in...</p>
    <script>
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      if (params.has('access_token')) {
        const qs = params.toString();
        window.location.replace(window.location.pathname + '?' + qs);
      } else {
        window.location.replace('/login');
      }
    </script>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const accessToken = requestUrl.searchParams.get("access_token");
  const refreshToken = requestUrl.searchParams.get("refresh_token");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const supabase = createSupabaseServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  return new NextResponse(buildHtmlRedirect(), {
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });
}
