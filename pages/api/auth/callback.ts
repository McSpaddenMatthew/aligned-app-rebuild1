// /pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerApi } from "../../../lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = getSupabaseServerApi(req, res);
  const { error } = await supabase.auth.exchangeCodeForSession(req.query);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const wanted =
    (typeof req.query.redirectedFrom === "string" && req.query.redirectedFrom) ||
    (typeof req.query.next === "string" && req.query.next) ||
    "/dashboard";

  return res.redirect(safeRel(wanted) ?? "/dashboard");
}

function safeRel(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) return null;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p.includes("\n") || p.includes("\r") || p.includes("\\")) return null;
  return p;
}

