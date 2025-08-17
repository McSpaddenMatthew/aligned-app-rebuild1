import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openai = new OpenAI({ apiKey });

const InputsSchema = z.object({
  candidateName: z.string().optional().default("Candidate"),
  candidateTitle: z.string().optional().default(""),
  location: z.string().optional().default(""),
  industryFit: z.string().optional().default(""),

  jobDescription: z.string().optional().default(""),
  recruiterNotes: z.string().optional().default(""),
  hmTranscript: z.string().optional().default(""),
  candidateResume: z.string().optional().default(""),
  candidateCall: z.string().optional().default(""),

  maxTokens: z.number().optional().default(1000),
  temperature: z.number().optional().default(0.25),
});

function buildMessages(input: z.infer<typeof InputsSchema>) {
  const {
    candidateName,
    candidateTitle,
    location,
    industryFit,
    jobDescription,
    recruiterNotes,
    hmTranscript,
    candidateResume,
    candidateCall,
  } = input;

  const system = `
You are **Aligned**, a recruiter's trust assistant. Your job is to transform messy inputs (HM conversation, candidate call notes, JD, recruiter intel, and optionally resume) into a crisp, decision-ready summary for a hiring manager.

## Evidence Weighting (DESCENDING):
1) **HM Conversation (source of truth)** — prefer this if anything conflicts.
2) **Candidate Call** — use for concrete quotes/observations.
3) **Job Description** — map must-haves to candidate evidence.
4) **Recruiter Intel** — helpful context.
5) **Resume** — **low-trust**; only use to corroborate. Never rely solely on resume for strong claims. If resume conflicts with HM/Call, **flag the discrepancy** in Risks.

## Style & Rules
- Decision-ready, concise, neutral. No puffery.
- Use **short quotes** only when they carry evidence (e.g., HM or candidate phrasing). If timestamps are present like [03:10], include them; **never invent timestamps**.
- Avoid copying large blocks of the user's text.
- Prefer outcomes, tradeoffs, and judgment signals over generic skills.
- If signals conflict, follow the weighting above and **note contradictions** under Risks.

## Output Format (Markdown)
# {candidateName} — {candidateTitle}{location ? " · " + location : ""} 
*Industry Fit:* {industryFit || "—"}

## What You Shared — What the Candidate Brings
| Hiring Context (from HM/Req) | Candidate Evidence (with timestamps if available) |
|---|---|
- Provide 2–6 tight rows that **map JD/HM must-haves** to **evidence from HM/Candidate Call**; resume only to corroborate.

## Why This Candidate Was Selected
- 2–4 bullets focused on **fit to HM-stated needs**, judgment, and tradeoff thinking.

## Known Risks & Mitigations
- **Risk:** <specific>  **Mitigation:** <practical step / evidence>
- Include any **conflicts or uncertainties** (especially resume vs HM/Call) here.

## Outcomes Delivered
- Concrete results (numbers or specific improvements) if present; otherwise crisp proxies.

## How ${candidateName} Frames Data for Leadership Decisions
- 1–3 bullets showing how the candidate **frames tradeoffs / cash impact / SLA risk** and turns analysis into decisions.
  `.trim();

  // Put HM and Candidate Call first to reinforce weighting
  const user = [
    `# HM Conversation (highest-weight)`,
    hmTranscript || "(none)",
    ``,
    `# Candidate Call (second-highest)`,
    candidateCall || "(none)",
    ``,
    `# Job Description / Must-haves`,
    jobDescription || "(none)",
    ``,
    `# Recruiter Intel`,
    recruiterNotes || "(none)",
    ``,
    `# Candidate Resume (low-trust corroboration)`,
    candidateResume || "(none)",
    ``,
    `# Header`,
    `Candidate Name: ${candidateName}`,
    `Candidate Title: ${candidateTitle}`,
    `Location: ${location}`,
    `Industry Fit: ${industryFit}`,
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
    { role: "user", content: "Generate the report now in the exact format above. Keep it concise and avoid long verbatim quotes." },
  ] as const;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsed = InputsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });
    }
    const inputs = parsed.data;
    const messages = buildMessages(inputs);

    const r1 = await openai.chat.completions.create({
      model,
      temperature: inputs.temperature,
      max_tokens: inputs.maxTokens,
      messages,
    });

    let text = r1.choices?.[0]?.message?.content?.trim() || "";

    // Simple guard against echoing giant blocks
    if (text && (text.includes(inputs.candidateResume.slice(0, 200)) || text.includes(inputs.hmTranscript.slice(0, 200)))) {
      const r2 = await openai.chat.completions.create({
        model,
        temperature: Math.max(0.15, inputs.temperature - 0.1),
        max_tokens: inputs.maxTokens,
        messages: [
          messages[0],
          { role: "user", content: "Rewrite more concisely. Do not copy large blocks from the inputs. Use short quotes only when they carry evidence." },
          { role: "assistant", content: text.slice(0, 2000) },
        ],
      });
      text = r2.choices?.[0]?.message?.content?.trim() || text;
    }

    return res.status(200).json({
      ok: true,
      model,
      generated: text,
      meta: { retry: false, ts: new Date().toISOString() },
    });
  } catch (e: any) {
    console.error("[Aligned] generate-summary error:", e?.message || e);
    return res.status(500).json({ error: "Generation failed", details: e?.message || String(e) });
  }
}
