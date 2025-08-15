// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

function extractText(resp: any): string {
  // 1) Convenience field on Responses API
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return resp.output_text.trim();
  }
  // 2) General Responses API shape: output[].content[].text
  if (Array.isArray(resp?.output)) {
    const text = resp.output
      .map((item: any) => {
        if (Array.isArray(item?.content)) {
          return item.content
            .map((c: any) =>
              typeof c?.text === "string" ? c.text : (typeof c === "string" ? c : "")
            )
            .join("");
        }
        return typeof item?.content?.[0]?.text === "string"
          ? item.content[0].text
          : "";
      })
      .join("\n")
      .trim();
    if (text) return text;
  }
  // 3) Old chat style compatibility
  const msg = resp?.choices?.[0]?.message?.content;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  if (Array.isArray(msg)) {
    const m = msg.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("").trim();
    if (m) return m;
  }
  return "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: req.headers.authorization || "" } },
  });
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  try {
    const { jobTitle, jobDescription, hmNotes, recruiterNotes } = (req.body || {}) as {
      jobTitle: string;
      jobDescription: string;
      hmNotes?: string;
      recruiterNotes?: string;
    };
    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: "Missing jobTitle or jobDescription" });
    }

    // Tie row to caller if we have a user token
    let userId: string | null = null;
    try {
      const { data } = await supabaseUser.auth.getUser();
      if (data?.user) userId = data.user.id;
    } catch {}

    const prompt = `
You are Aligned, the trust layer between recruiters and hiring managers.
Create a concise, structured candidate/market summary in Markdown with EXACTLY these sections:

1) What You Shared – What the Candidate/Market Brings
   - Bullet comparison of role needs vs likely candidate strengths. Infer needs from the JD/HM notes.

2) Why This Role Is Hard / Market Reality (1–4 bullets)

3) Known Risks & Mitigations
   - Two-column table (Risk | Mitigation), 3–6 rows.

4) Outcomes to Prioritize in Screens (bulleted, measurable)

5) Interview Focus Guide
   - Bullets with targeted probing questions tied to the JD.

Job Title: ${jobTitle}

Job Description/Requirements:
${jobDescription}

HM Notes:
${hmNotes || "(none provided)"}

Recruiter Notes:
${recruiterNotes || "(none provided)"}

Write only the summary, no preamble.`.trim();

    // 30s timeout + cap output size
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 30_000);

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.1",        // <-- you're on 5.1; change to "gpt-5" later if you prefer
        input: prompt,
        max_output_tokens: 900,
      }),
    });
    clearTimeout(to);

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return res.status(502).json({ error: `OpenAI error: ${txt.slice(0, 800)}` });
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown = extractText(aiJson);
    if (!summaryMarkdown) {
      return res.status(502).json({
        error: `OpenAI response had no text. Raw: ${JSON.stringify(aiJson).slice(0, 600)}`
      });
    }

    const { data, error } = await supabaseAdmin
      .from("summaries")
      .insert([{
        user_id: userId,
        job_title: jobTitle,
        job_description: jobDescription,
        hm_notes: hmNotes ?? null,
        recruiter_notes: recruiterNotes ?? null,
        summary_markdown: summaryMarkdown,
      }])
      .select("id")
      .single();

    if (error) return res.status(500).json({ error: `Supabase insert error: ${error.message}` });
    return res.status(200).json({ id: data.id });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "OpenAI request timed out" : (e?.message || "Server error");
    console.error("generate-summary error:", e);
    return res.status(500).json({ error: msg });
  }
}
