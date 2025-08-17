import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const STRICT = (process.env.ALIGNED_STRICT || "true").toLowerCase() !== "false";
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

  maxTokens: z.number().optional().default(1100),
  temperature: z.number().optional().default(0.2),
});

function buildMessages(input: z.infer<typeof InputsSchema>) {
  const {
    candidateName, candidateTitle, location, industryFit,
    jobDescription, recruiterNotes, hmTranscript, candidateResume, candidateCall,
  } = input;

  const system = `
You are **Aligned**, a recruiter's trust assistant. Produce a decision-ready report that a hiring manager can act on.

## Evidence Weighting (desc)
1) **HM Conversation** — source of truth.
2) **Candidate Call** — next strongest.
3) **Job Description** — define must-haves from JD + HM.
4) **Recruiter Intel** — context.
5) **Resume** — **low-trust**; resume-only evidence counts as **zero**. Flag contradictions.

## Decision Rules ${STRICT ? "(STRICT MODE ON)" : ""}
- Derive **3–6 must-haves** from HM + JD (skills/outcomes/behaviors).
- For each must-have, assign **Coverage**:
  - **STRONG**: clear evidence from HM or Candidate Call (quotes/timestamps ok).
  - **PARTIAL**: some signal but incomplete.
  - **MISSING**: no reliable evidence or **resume-only**.
- If HM states a **no-go** that appears true → **DO NOT PROCEED**.
- If **≥2 must-haves are MISSING** → **DO NOT PROCEED**.
- If **1 MISSING** or a major risk is unmitigated → **HOLD** (ask for specific evidence).
- Only when all must-haves are STRONG/PARTIAL **and** risks are mitigated → **PROCEED**.
- Prefer **HOLD/DECLINE** when evidence is thin or conflicting.

## Confidence to Meet (0–10) — scoring rubric
Compute a 0–10 score for whether the HM should take a first conversation.
1) Let N = # of must-haves (3–6). Let S = STRONG count, P = PARTIAL count, M = MISSING count.
2) BaseScore = round( (2*S + 1*P) / (2*N) * 10 ).
3) Adjustments (clamp 0–10 at the end):
   - If HM has an explicit **no-go** that appears true → set max to 3.
   - For each **MISSING** → −2.
   - For each **major unmitigated risk** → −1 to −3 (your judgment; be conservative).
   - **Resume-only evidence never increases score**.
Return a single integer 0–10.

## Style
- Direct, professional, concise. No puffery. Short sentences.
- Include timestamps if provided like [03:10] but **never invent them**.
- Do not copy large blocks from inputs.

## Output Format (Markdown)
> **Bottom Line:** PROCEED | HOLD | DO NOT PROCEED — one-line reason.  
> **Confidence to Meet (0–10): X** — one line explaining the score.

# ${candidateName} — ${candidateTitle}${location ? " · " + location : ""}
*Industry Fit:* ${industryFit || "—"}

## Coverage vs Must-Haves
| Must-have | Evidence (cite HM/Call when possible) | Coverage |
|---|---|---|

## What You Shared — What the Candidate Brings
| Hiring Context (from HM/Req) | Candidate Evidence (with timestamps if available) |
|---|---|

## Why This Candidate Was Selected (or Not)
- 2–4 bullets tied to **HM needs** and tradeoff thinking.

## Known Risks & Mitigations
- **Risk:** <specific> **Mitigation:** <practical step>.
- Include contradictions (e.g., resume vs HM/Call).

## Outcomes Delivered
- Concrete outcomes (numbers/improvements) or credible proxies.

## How ${candidateName} Frames Data for Leadership Decisions
- 1–3 bullets on framing **tradeoffs / cash impact / SLA risk** into decisions.
  `.trim();

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
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
    { role: "user", content: "Generate the report exactly in the format above. Be decisive. Include the confidence score." },
  ] as const;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const parsed = InputsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });

    const inputs = parsed.data;
    const messages = buildMessages(inputs);

    const r1 = await openai.chat.completions.create({
      model, temperature: inputs.temperature, max_tokens: inputs.maxTokens, messages,
    });

    let text = r1.choices?.[0]?.message?.content?.trim() || "";

    // Anti-echo: if large chunk of an input leaked, request concise rewrite
    const biggest = [inputs.hmTranscript, inputs.candidateCall, inputs.jobDescription, inputs.candidateResume]
      .filter(Boolean).sort((a, b) => (b!.length - a!.length))[0] || "";
    if (biggest && text.includes(biggest.slice(0, Math.min(200, biggest.length)))) {
      const r2 = await openai.chat.completions.create({
        model, temperature: Math.max(0.1, inputs.temperature - 0.1), max_tokens: inputs.maxTokens,
        messages: [
          messages[0],
          { role: "user", content: "Rewrite concisely. Do not copy big blocks. Keep the same Bottom Line, confidence, and tables." },
          { role: "assistant", content: text.slice(0, 2000) },
        ],
      });
      text = r2.choices?.[0]?.message?.content?.trim() || text;
    }

    return res.status(200).json({ ok: true, model, generated: text, meta: { strict: STRICT, ts: new Date().toISOString() } });
  } catch (e: any) {
    console.error("[Aligned] generate-summary error:", e?.message || e);
    return res.status(500).json({ error: "Generation failed", details: e?.message || String(e) });
  }
}
