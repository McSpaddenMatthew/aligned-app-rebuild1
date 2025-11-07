// app/api/generate-summary/route.ts
import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini"; // or "gpt-4o" if you prefer

export async function POST(req: NextRequest) {
  try {
    const { title, step1, step2, step3, step4, step5 } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY on the server." },
        { status: 500 }
      );
    }

    // Build a concise, deterministic prompt
    const system = [
      "You are an expert executive recruiter.",
      "Write a crisp, email-ready candidate summary for a hiring manager.",
      "Prefer clear bullets over long paragraphs. Keep it under ~300 words.",
      "Never invent facts not present in the sources.",
    ].join(" ");

    const user = `
Title: ${title || "Candidate Summary"}

Sources, in priority order:
1) Hiring Manager Call (notes/transcript):
${step1 || "(none)"}

2) Resume:
${step2 || "(none)"}

3) Candidate Call (transcript/notes):
${step3 || "(none)"}

4) Job Description:
${step4 || "(none)"}

5) Optional Intel (org/company/role):
${step5 || "(none)"}

Output format (exactly):
- A bold title on first line (use the Title above).
- Then these sections as short bullets:
  1) What You Shared — What the Candidate Brings (include quotes if present)
  2) Why This Candidate Was Selected
  3) Known Risks & Mitigations
  4) Outcomes Delivered
  5) How [Name] Frames Data for Leadership Decisions
  6) Next Steps + scheduling line
Keep it actionable, factual, and non-redundant. Do not include any meta commentary about the process.
`.trim();

    // Call OpenAI (Responses API style)
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
      }),
    });

    if (!completion.ok) {
      const errText = await completion.text();
      return NextResponse.json(
        { error: `OpenAI error: ${errText}` },
        { status: 500 }
      );
    }

    const data = await completion.json();
    const text: string =
      data.choices?.[0]?.message?.content?.trim() ||
      "No content returned from the model.";

    // Return both plain text and a minimal HTML version for preview
    const html = text
      .split("\n")
      .map((line: string) => {
        if (/^\s*[-–•]\s+/.test(line)) return `<li>${escapeHtml(line.replace(/^\s*[-–•]\s+/, ""))}</li>`;
        if (/^\s*\d+\)\s+/.test(line)) return `<li>${escapeHtml(line.replace(/^\s*\d+\)\s+/, ""))}</li>`;
        if (/^\*\*(.+)\*\*/.test(line)) {
          return `<p><strong>${escapeHtml(line.replace(/^\*\*(.+)\*\*.*/, "$1"))}</strong></p>`;
        }
        return `<p>${escapeHtml(line)}</p>`;
      })
      .join("")
      // wrap any standalone LI's in UL
      .replace(/(?:^|<\/p>)(<li>.*?<\/li>)(?=<p>|$)/gs, "<ul>$1</ul>");

    return NextResponse.json({ text, html });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error." }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

