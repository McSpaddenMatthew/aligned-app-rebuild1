// pages/api/get-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).send("Missing id");

  // Select * so we don't error on unknown/legacy columns
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(500).send(error.message);
  if (!data) return res.status(404).send("Not found");

  // Try common legacy names if summary is empty
  const summary =
    (data as any).summary ??
    (data as any).body ??
    (data as any).text ??
    (data as any).description ??
    null;

  const row = {
    id: data.id,
    title: (data as any).title ?? null,
    summary,
    created_at: (data as any).created_at ?? null,
  };

  res.status(200).json({ summary: row });
}
