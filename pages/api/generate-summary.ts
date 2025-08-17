import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-5.1-mini";
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
  temperature: z.number().optional().default(0.3),
});

function buildMessages(input: z.infer<typeof InputsSchema>) {
  const { candidateName, candidateTitle, location, industryFit,
          jobDescription, recruiterNotes, hmTranscript,
          candidateResume, candidateCall } = input;

  const system = `
You are **Aligned**, a recruiter's trust assistant.
Transform messy inputs (JD, notes, transcripts, resume) into a crisp, hiring-manager-ready **Candidate Trust Report**.

Rules:
- Do NOT copy-paste big blocks from inputs.
- Synthesize, tighten, neutral/professional tone.
- Prefer quantified outcomes; include timestamps in quotes if present.
- If info is missing, say "Not observed." Do not invent specifics.

Output (Markdown, exact order):

# [Candidate Name] — [Title] · [Location]
*Industry Fit:* [one short line]

## What You Shared – What the Candidate Brings
| Hiring Context (from HM/Req) | Candidate Evidence (with timestamps if available) |
|---|---|
| ... | ... |

## Why This Candidate Was Selected
(2–4 sentences.)

## Known Risks & Mitigations
- **Risk:** ... → **Mitigation:** ...
- ...

## Outcomes Delivered
- [quantified outcome]
- ...

## How ${candidateName} Frames Data for Leadership Decisions
(Short narrative on decision framing for execs.)
`;

  const user = `
Candidate Header:
- Name: ${candidateName}
- Title: ${candidateTitle}
- Location: ${location}
- Industry Fit: ${industryFit}

Raw Inputs:
--- Job Description ---
${jobDescription}

--- Recruiter Notes ---
${recruiterNotes}

--- Hiring Manager Transcript ---
${hmTranscript}

--- Candidate Resume ---
${candidateResume}

--- Candidate Call Transcript ---
${candidateCall}
`;
  return [{ role: "system", content: system }, { role: "user", content: user }] as const;
}

function looksLikeEcho(output: string, inputs: z.infer<typeof InputsSchema>) {
  const blocks = [inputs.candidateResume, inputs.jobDescription]
    .map((t) => (t || "").trim())
    .filter((t) => t.length > 400);
  return blocks.some((b) => output.includes(b.slice(0, 200)));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY in .env.local" });

    const parsed = InputsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

    const inputs = parsed.data;
    const messages = buildMessages(inputs);

    const r1 = await openai.chat.completions.create({
      model, temperature: inputs.temperature, max_tokens: inputs.maxTokens, messages,
    });
    let text = r1.choices?.[0]?.message?.content?.trim() || "";

    if (looksLikeEcho(text, inputs)) {
      const r2 = await openai.chat.completions.create({
        model, temperature: Math.max(0.2, inputs.temperature - 0.1), max_tokens: inputs.maxTokens,
        messages: [
          messages[0],
          { role: "user", content: (messages[1] as any).content + "\nIMPORTANT: Do not copy large blocks. Synthesize concisely with evidence." },
        ],
      });
      text = r2.choices?.[0]?.message?.content?.trim() || text;
      return res.status(200).json({ ok: true, model, generated: text, meta: { retry: true, ts: new Date().toISOString() } });
    }

    return res.status(200).json({ ok: true, model, generated: text, meta: { retry: false, ts: new Date().toISOString() } });
  } catch (e: any) {
    console.error("[Aligned] generate-summary error:", e?.message || e);
    return res.status(500).json({ error: "Generation failed", details: e?.message || String(e) });
  }
}
