// /pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerApi } from "../../../lib/supabase-server";

/**
 * Handles BOTH kinds of Supabase magic-link returns:
 * 1) Code/PKCE:        /api/auth/callback?code=...
 * 2) Hash tokens (bridged): /api/auth/callback?access_token=...&refresh_token=...
 *
 * Either way, we set the auth cookie server-side and then redirect to /dashboard (or a safe path).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = getSupabaseServerApi(req, res);

  const { code, access_token, refresh_token } = req.query as {
    code?: string;
    access_token?: string;
    refresh_token?: string;
  };

  let errMsg: string | null = null;

  try {
    if (code) {
      // Case 1: Code/PKCE flow
      const { error } = await supabase.auth.exchangeCodeForSession({ code });
      if (error) errMsg = error.message;
    } else if (access_token && refresh_token) {
      // Case 2: Hash token flow (bridged from /auth/confirm)
      // Set the session explicitly using the provided tokens.
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) errMsg = error.message;
    } else {
      errMsg = "Missing auth parameters";
    }
  } catch (e: any) {
    errMsg = e?.message || "Authentication failed";
  }

  if (errMsg) {
    console.error("[auth/callback] session set error:", errMsg);
    return res.redirect(`/login?error=${encodeURIComponent(errMsg)}`);
  }

  // Decide where to go next (safe relative path only)
  const wanted =
    (typeof req.query.redirectedFrom === "string" && req.query.redirectedFrom) ||
    (typeof req.query.next === "string" && req.query.next) ||
    "/dashboard";

  return res.redirect(safeRel(wanted) ?? "/dashboard");
}

function safeRel(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) return null; // block external
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p.includes("\n") || p.includes("\r") || p.includes("\\")) return null;
  return p;
}

