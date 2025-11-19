// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Required env vars:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 * - OPENAI_API_KEY
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: req.headers.authorization || "" } },
  });
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  try {
    const {
      candidateName,
      roleTitle,
      candidateCall,
      candidateResume,
      hmConversation,
      jobDescription,
      otherIntel,
    } = req.body as Record<string, string>;

    if (!candidateName || !roleTitle || !jobDescription) {
      return res.status(400).json({ error: "candidateName, roleTitle, and jobDescription are required" });
    }
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    let userId: string | null = null;
    try {
      const { data, error } = await supabaseUser.auth.getUser();
      if (!error && data?.user) userId = data.user.id;
    } catch {
      userId = null;
    }

    const packet = {
      candidateName,
      roleTitle,
      candidateCall: candidateCall || "",
      candidateResume: candidateResume || "",
      hmConversation: hmConversation || "",
      jobDescription,
      otherIntel: otherIntel || "",
    };

    const prompt = `You are Aligned, the McKinsey-style trust layer between recruiters and private equity operating partners.
Craft a decisive memo that lets the operating partner know exactly why this hire matters, what risks exist, and how to pressure-test them.

Use this structure and tone:
1) Candidate Fit Snapshot — 2 bullets that tie ${candidateName} to the ${roleTitle} mandate
2) Value Creation Moves — bullets referencing resume + transcript proof points
3) Known Risks & Mitigations — Risk | Mitigation table grounded in HM conversation
4) Interview Focus Guide — bullets with probing questions the operating partner should ask
5) Next Steps — scheduling instructions + what materials to request next

Source material:
- Candidate call transcript: ${packet.candidateCall || "(none)"}
- Candidate resume: ${packet.candidateResume || "(none)"}
- Hiring manager conversation: ${packet.hmConversation || "(none)"}
- Job description / KPI targets: ${packet.jobDescription}
- Additional intel: ${packet.otherIntel || "(none)"}

Keep it under 350 words, avoid fluff, and never invent facts.`.trim();

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.1",
        input: prompt,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return res.status(502).json({ error: `OpenAI error: ${txt.slice(0, 800)}` });
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown: string =
      aiJson?.output_text ?? aiJson?.choices?.[0]?.message?.content ?? "[No output]";

    const { data, error } = await supabaseAdmin
      .from("summaries")
      .insert([
        {
          user_id: userId,
          job_title: roleTitle,
          job_description: jobDescription,
          hm_notes: hmConversation ?? null,
          recruiter_notes: JSON.stringify(packet),
          summary_markdown: summaryMarkdown,
        },
      ])
      .select("id")
      .single();

    if (error) {
      return res.status(500).json({ error: `Supabase insert error: ${error.message}` });
    }

    return res.status(200).json({ id: data.id });
  } catch (e: any) {
    console.error("generate-summary error:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
