// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Required env vars:
 * - OPENAI_API_KEY
 * - NEXT_PUBLIC_SUPABASE_URL
 * - (one of) SUPABASE_SERVICE_ROLE_KEY | NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Parts = {
  hiringManager?: string;
  candidate?: string;
  jd?: string;
  resume?: string;
  recruiterNotes?: string;
};

function buildPrompt(parts: Parts) {
  const hm = (parts.hiringManager ?? "").trim();
  const cand = (parts.candidate ?? "").trim();
  const jd = (parts.jd ?? "").trim();
  const resume = (parts.resume ?? "").trim();
  const notes = (parts.recruiterNotes ?? "").trim();

  return `
You are a recruiting analyst producing a decision-useful summary for a PE-backed company.
Be concise and strictly grounded in the provided inputs. Do NOT invent facts.
If evidence is insufficient for any bullet or section, write exactly: "No supporting evidence found."

Formatting rules:
- Output clean Markdown (no code fences).
- Prefer short, scannable bullets.
- Merge/condense duplicate or overlapping bullets (avoid redundancy).
- If timecodes appear in transcripts (e.g., [00:12:34] or (12:34)), include them at the end of the relevant bullet.

Return the summary with these EXACT sections (no extras, no Role Snapshot):

## Hiring Manager Priorities (with timecodes)
- 4–6 bullets distilled from the HM transcript.
- Include timecodes when present.
- If priorities are unclear: a SINGLE bullet: "No supporting evidence found."

## Candidate Highlights (with timecodes)
- 4–6 bullets that map to HM needs.
- Phrase as “Matches Priority X: …” or “Gap vs Priority X: …”.
- Include timecodes when present.
- Remove duplicate ideas.
- If insufficient evidence: a SINGLE bullet: "No supporting evidence found."

---
## Strengths
- 3–5 bullets focused on repeatable impact.
- If insufficient evidence: a SINGLE bullet: "No supporting evidence found."

---
## Risks / Concerns
- 3–5 bullets (skill gaps, ramp risk, cultural/fit risks).
- If insufficient evidence: a SINGLE bullet: "No supporting evidence found."

## Private Equity Lens
- **Value Creation Impact** — bullets on where the candidate can move the needle (cost, speed, quality, GTM enablement). If unclear: "No supporting evidence found."
- **Execution Risk** — bullets on ramp risk, dependencies, knowledge gaps. If unclear: "No supporting evidence found."
- **Upside Potential** — bullets on leadership runway/scope growth. If unclear: "No supporting evidence found."

Source material (verbatim):

[HIRING MANAGER TRANSCRIPT]
${hm || "(none provided)"}

[CANDIDATE TRANSCRIPT]
${cand || "(none provided)"}

[JOB DESCRIPTION]
${jd || "(none provided)"}

[RESUME]
${resume || "(none provided)"}

[RECRUITER NOTES]
${notes || "(none provided)"}
  `.trim();
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write crisp, structured recruiting summaries for PE stakeholders. You never fabricate details.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1400,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`OpenAI ${resp.status}: ${text || "request failed"}`);
  }

  const data = await resp.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    "";
  return String(content).trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const { title, parts, user_id } = req.body ?? {};
    if (!parts || typeof parts !== "object") {
      return res.status(400).send("Body must include { parts: {...} }");
    }

    const prompt = buildPrompt(parts as Parts);
    const generated = await callOpenAI(prompt);
    if (!generated) throw new Error("Model returned empty content");

    const insert = {
      title: title ?? null,
      summary: generated,
      user_id: user_id ?? null, // keep nullable for MVP
    };

    const { data, error } = await supabase
      .from("summaries")
      .insert(insert)
      .select("id")
      .single();

    if (error) return res.status(500).send(error.message);

    return res.status(200).json({ id: data.id, summary: generated });
  } catch (e: any) {
    return res.status(500).send(e?.message || "Internal error");
  }
}
