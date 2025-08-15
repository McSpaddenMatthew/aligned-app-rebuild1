// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

// Prefer the server-only service role key if available (bypasses strict RLS for inserts).
// Fallback to anon if you haven't set a service role key yet.
const serviceKey =
  (process.env.SUPABASE_SERVICE_ROLE_KEY as string) ||
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

type Data =
  | { id: string; summary: string; candidate_name?: string | null; role?: string | null }
  | { error: string };

function extractCandidateName(text: string): string | null {
  // Try common labels first
  const label =
    text.match(/^\s*(?:candidate(?:\s*name)?|name)\s*:\s*(.+)$/im)?.[1] ||
    text.match(/^\s*hm\s*notes:.*?\b(?:candidate|name)\b\s*:\s*(.+)$/im)?.[1];
  if (label) return label.trim();

  // Try first heading
  const h = text.match(/^\s*#{1,3}\s+(.+)$/m)?.[1];
  if (h) return h.trim();

  // Try "• Jane Doe – " bullets
  const bullet = text.match(/^[\-\*\u2022]\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m)?.[1];
  if (bullet) return bullet.trim();

  return null;
}

function extractRole(text: string): string | null {
  const role =
    text.match(/^\s*(?:role|position|title)\s*:\s*(.+)$/im)?.[1] ||
    text.match(/\bfor\s+the\s+role\s+of\s+(.+?)(?:[,\n]|$)/i)?.[1];
  return role ? role.trim() : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { input, candidateName, role } = (req.body || {}) as {
      input?: string;
      candidateName?: string;
      role?: string;
    };

    const summary = (input || "").trim();
    if (!summary) {
      res.status(400).json({ error: "Missing 'input' text." });
      return;
    }

    // Heuristics (client-provided values win; otherwise infer)
    const inferredName = candidateName?.trim() || extractCandidateName(summary);
    const inferredRole = role?.trim() || extractRole(summary);

    // Save into public.cases
    // Ensure cases has columns: id (uuid default), candidate_name (text), role (text, nullable), summary_markdown (text), created_at (timestamptz default)
    const payload = {
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
      // Helpful error passthrough for RLS issues
      res.status(500).json({ error: `Insert failed: ${error.message}` });
      return;
    }

    const id = data?.[0]?.id as string | undefined;
    if (!id) {
      res.status(500).json({ error: "Saved but no id returned." });
      return;
    }

    res.status(200).json({
      id,
      summary, // echo back for optional client preview
      candidate_name: inferredName || null,
      role: inferredRole || null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Unexpected error" });
  }
}
