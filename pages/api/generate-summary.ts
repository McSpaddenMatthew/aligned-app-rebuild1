import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Required env vars (set in Vercel → Project → Settings → Environment Variables → Production):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY   (red service_role key from Supabase — server only)
 * - OPENAI_API_KEY              (sk-... from OpenAI)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Optional: client for reading the user from a bearer token
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: req.headers.authorization || "" } },
  });

  // Admin client for DB writes (bypasses RLS) — never expose this key in browser code
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  try {
    const { jobTitle, jobDescription, hmNotes, recruiterNotes } = req.body as {
      jobTitle: string;
      jobDescription: string;
      hmNotes?: string;
      recruiterNotes?: string;
    };

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: "Missing jobTitle or jobDescription" });
    }
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    // Try to attach user_id if a token is provided
    let userId: string | null = null;
    try {
      const { data, error } = await supabaseUser.auth.getUser();
      if (!error && data?.user) userId = data.user.id;
    } catch { /* ignore */ }

    // --- Call OpenAI Responses API ---
    const prompt = `
You are Aligned, the trust layer between recruiters and hiring managers.
Create a concise, structured hiring-manager–ready report.

Use this exact section order and tone:
1) What You Shared – What the Candidate/Market Brings (bullet comparison)
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

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: prompt,
        temperature: 0.2,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return res.status(502).json({ error: `OpenAI error: ${txt.slice(0, 500)}` });
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown =
      aiJson.output_text ??
      aiJson.choices?.[0]?.message?.content ??
      "[No output]";

    // --- Insert with service role (bypasses RLS) ---
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

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ id: data.id });
  } catch (e: any) {
    console.error("generate-summary error:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
