// pages/api/list-summaries.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerApi } from "../../lib/supabase-server"; // server API client (reads/writes cookies)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const supabase = getSupabaseServerApi(req, res);

  // 1) Read the authenticated user from the cookie/session
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 2) Return ONLY this user's summaries
  const { data, error } = await supabase
    .from("candidate_summaries")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ summaries: data ?? [] });
}
