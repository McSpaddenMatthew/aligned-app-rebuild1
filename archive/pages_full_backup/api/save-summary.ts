// pages/api/save-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Prefer service role if you have it set; falls back to anon if not.
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Parts = {
  hiringManager?: string;
  candidate?: string;
  jd?: string;
  resume?: string;
  recruiterNotes?: string;
};

function composeSummaryFromParts(parts: Parts): string {
  const sections: Array<[string, string | undefined]> = [
    ["Hiring Manager Call Transcript", parts.hiringManager],
    ["Candidate Call Transcript", parts.candidate],
    ["Job Description (JD)", parts.jd],
    ["Resume", parts.resume],
    ["Recruiter Additional Notes", parts.recruiterNotes],
  ];

  const blocks = sections
    .filter(([, v]) => (v ?? "").trim().length > 0)
    .map(([label, v]) => `## ${label}\n${(v ?? "").trim()}`);

  return blocks.length ? blocks.join("\n\n") : "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { title, summary, parts, user_id } = req.body ?? {};

  let finalSummary: string = typeof summary === "string" ? summary : "";
  if (!finalSummary && parts && typeof parts === "object") {
    finalSummary = composeSummaryFromParts(parts as Parts);
  }

  if (!finalSummary.trim()) {
    return res.status(400).send("Please provide either `summary` or `parts` with at least one section.");
  }

  const insert = {
    title: title ?? null,
    summary: finalSummary,
    user_id: user_id ?? null,
  };

  const { data, error } = await supabase
    .from("summaries")
    .insert(insert)
    .select("id")
    .single();

  if (error) return res.status(500).send(error.message);
  res.status(200).json({ id: data.id });
}
