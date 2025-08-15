// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

// Use service role key if available (server-only), else anon (MVP).
const serviceKey =
  (process.env.SUPABASE_SERVICE_ROLE_KEY as string) ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

type Ok =
  | { id: string; summary: string; candidate_name?: string | null; role?: string | null }
type Err = { error: string };

function extractCandidateName(text: string): string | null {
  const label =
    text.match(/^\s*(?:candidate(?:\s*name)?|name)\s*:\s*(.+)$/im)?.[1] ||
    text.match(/^\s*#{1,3}\s+(.+)$/m)?.[1]; // first heading
  if (label) return label.trim();
  const bullet = text.match(/^[\-\*\u2022]\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m)?.[1];
  return bullet ? bullet.trim() : null;
}

function extractRole(text: string): string | null {
  const role =
    text.match(/^\s*(?:role|position|title)\s*:\s*(.+)$/im)?.[1] ||
    text.match(/\bfor\s+the\s+role\s+of\s+(.+?)(?:[,\n]|$)/i)?.[1];
  return role ? role.trim() : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { input, candidateName, role, userId } = (req.body || {}) as {
      input?: string;
      candidateName?: string;
      role?: string;
      userId?: string | null;
    };

    const summary = (input || "").trim();
    if (!summary) return res.status(400).json({ error: "Missing 'input' text." });

    // Inferred values (client values win)
    const inferredName = candidateName?.trim() || extractCandidateName(summary);
    const inferredRole = role?.trim() || extractRole(summary);

    // If your DB requires user_id NOT NULL, enforce here:
    if (!userId) {
      return res.status(400).json({ error: "Missing user id" });
    }

    const payload = {
      user_id: userId, // ✅ satisfy NOT NULL constraint
      candidate_name: inferredName || null,
      role: inferredRole || null,
      summary_markdown: summary,
    };

    const { data, error } = await supabase
      .from("cases")
      .insert([payload])
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({ error: `Insert failed: ${error.message}` });
    }

    const id = data?.[0]?.id as string | undefined;
    if (!id) return res.status(500).json({ error: "Saved but no id returned." });

    res.status(200).json({
      id,
      summary,
      candidate_name: inferredName || null,
      role: inferredRole || null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Unexpected error" });
  }
}
