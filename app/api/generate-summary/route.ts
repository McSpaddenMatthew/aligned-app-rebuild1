import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 60000);

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
      status: 500,
    });
  }

  try {
    const {
      hiringManagerNotes,
      candidateNotes,
      candidateResume,
      roleTitle,
      company,
    } = await req.json();

    if (!hiringManagerNotes?.trim() || !candidateNotes?.trim()) {
      return new Response(
        JSON.stringify({
          error: "hiringManagerNotes and candidateNotes are required.",
        }),
        { status: 400 }
      );
    }

    const system =
      "Generate decision-ready 'Aligned' reports for executive hiring managers. Be concise, credible, and honest. Use the exact section order provided. Prefer hiring manager evidence over resume claims.";

    const userPrompt = `You are creating an Aligned candidate report for ${
      roleTitle || "the target role"
    } at ${company || "the company"}.

=== Hiring Manager Evidence (verbatim/notes) ===
${hiringManagerNotes}

=== Candidate Notes ===
${candidateNotes}

=== Candidate Resume (if relevant) ===
${candidateResume || "(none provided)"}

Now produce the report in this exact order and with these exact headings:

1) Candidate header (name if known or "Candidate", current title, location, industry fit)
2) What You Shared – What the Candidate Brings (2-column markdown table; 4–6 rows; left = HM priorities with short quotes, right = candidate evidence. If paraphrasing, label [paraphrase].)
3) Why This Candidate Was Selected (2–4 sentences)
4) Known Risks & Mitigations (3–5 bullets; frank but fair)
5) Outcomes Delivered (4–6 bullets; measurable when possible)
6) How Candidate Frames Data for Leadership Decisions (3–5 bullets tied to business outcomes)
7) Resume Note + Scheduling Line (1–2 sentences + CTA)

Rules:
- ~500–800 words total
- No fabrications; say “not specified” if unknown
- Prefer numbers/specifics; clean markdown.`;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

    const rsp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    }).finally(() => clearTimeout(t));

    if (!rsp.ok) {
      const err = await rsp.text();
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${err}` }),
        { status: rsp.status }
      );
    }

    const data = await rsp.json();
    const summary = data?.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500 }
    );
  }
}

