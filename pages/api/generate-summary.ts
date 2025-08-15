import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// IMPORTANT: You must set OPENAI_API_KEY in your env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Get user from supabase auth cookie (server-side)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.authorization?.replace("Bearer ", "") || undefined
    );

    // Fallback: no server-session; allow insert without binding user (RLS will still protect)
    if (authError) {
      // no-op; we’ll still try to insert; if RLS blocks, it’ll error.
    }

    const { jobTitle, jobDescription, hmNotes, recruiterNotes } = req.body as {
      jobTitle: string;
      jobDescription: string;
      hmNotes?: string;
      recruiterNotes?: string;
    };

    const prompt = `
You are Aligned, the trust layer between recruiters and hiring managers.
Create a concise, structured hiring-manager–ready report from the following inputs.

Use this exact section order and tone:
1) What You Shared – What the Candidate/Market Brings (bullet comparison, infer key needs from JD/HM notes)
2) Why This Role Is Hard / Market Reality (1–3 bullets)
3) Known Risks & Mitigations (table: Risk | Mitigation)
4) Outcomes to Prioritize in Screens (bullets, measurable)
5) Interview Focus Guide (bullets with sample probing questions)

Job Title: ${jobTitle}
Job Description/Requirements:
${jobDescription}

HM Notes:
${hmNotes || "(none provided)"}

Recruiter Notes:
${recruiterNotes || "(none provided)"}

Keep it crisp. No fluff.`;

    // Call OpenAI Responses API (simple fetch; no SDK required)
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: prompt,
        temperature: 0.2
      })
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`OpenAI error: ${txt}`);
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown =
      aiJson.output_text ??
      aiJson.choices?.[0]?.message?.content ??
      "[No output]";

    // Insert into Supabase
    const { data, error } = await supabase
      .from("summaries")
      .insert([{
        user_id: user?.id ?? null,
        job_title: jobTitle,
        job_description: jobDescription,
        hm_notes: hmNotes ?? null,
        recruiter_notes: recruiterNotes ?? null,
        summary_markdown: summaryMarkdown
      }])
      .select("id")
      .single();

    if (error) throw error;

    res.status(200).json({ id: data.id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }
}
