// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Required env vars (Vercel → Project → Settings → Environment Variables)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

// Clamp big pastes so the model doesn't waste output budget
function clamp(s: unknown, max = 10000) {
  const t = (typeof s === "string" ? s : s ?? "").toString();
  return t.length > max ? t.slice(0, max) + "\n\n[...truncated...]" : t;
}

// Best-effort text extraction for the Responses API
function extractText(resp: any): string {
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return resp.output_text.trim();
  }
  if (Array.isArray(resp?.output)) {
    const parts: string[] = [];
    for (const item of resp.output) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c?.text === "string") parts.push(c.text);
          else if (typeof c === "string") parts.push(c);
          else if (typeof c?.output_text === "string") parts.push(c.output_text);
        }
      } else if (typeof item?.output_text === "string") {
        parts.push(item.output_text);
      }
    }
    const joined = parts.join("\n").trim();
    if (joined) return joined;
  }
  const msg = resp?.choices?.[0]?.message?.content;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  if (Array.isArray(msg)) {
    const m = msg.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("");
    if (m.trim()) return m.trim();
  }
  return "";
}

function send(res: NextApiResponse, code: number, payload: any) {
  res.status(code).json(payload);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE) {
    return send(res, 500, { error: "Supabase environment variables are missing" });
  }
  if (!OPENAI_API_KEY) return send(res, 500, { error: "OPENAI_API_KEY is not set" });

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: req.headers.authorization || "" } },
  });
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  try {
    const body = (req.body || {}) as {
      jobTitle?: string;
      jobDescription?: string;
      hmNotes?: string;
      recruiterNotes?: string;
    };

    const jobTitle = clamp(body.jobTitle, 200);
    const jobDescription = clamp(body.jobDescription, 12000);
    const hmNotes = clamp(body.hmNotes, 8000);
    const recruiterNotes = clamp(body.recruiterNotes, 4000);

    if (!jobTitle || !jobDescription) {
      return send(res, 400, { error: "Missing jobTitle or jobDescription" });
    }

    // Resolve caller (non-fatal if missing)
    let userId: string | null = null;
    try {
      const { data } = await supabaseUser.auth.getUser();
      if (data?.user) userId = data.user.id;
    } catch {}

    // Tight prompt; asks for Markdown only
    const prompt = `
You are Aligned, the trust layer between recruiters and hiring managers.

Write a concise **Markdown** summary **<= 600 words** with EXACTLY these sections:

1) What You Shared – What the Candidate/Market Brings
   - 4–7 bullets mapping role needs to candidate strengths (infer needs from JD/HM notes).

2) Why This Role Is Hard / Market Reality
   - 3–5 bullets.

3) Known Risks & Mitigations
   - Two-column table with 3–6 rows (Risk | Mitigation).

4) Outcomes to Prioritize in Screens
   - 4–6 measurable bullets.

5) Interview Focus Guide
   - 5–8 bullets with pointed probing questions tied to the JD.

Do NOT include any preamble or headings like "Summary:". Output Markdown only.

Job Title:
${jobTitle}

Job Description / Requirements:
${jobDescription}

HM Notes:
${hmNotes || "(none provided)"}

Recruiter Notes:
${recruiterNotes || "(none provided)"}  
`.trim();

    // OpenAI Responses API using a non-reasoning model
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // <— non-reasoning, reliably returns text
        input: prompt,
        max_output_tokens: 1200,
      }),
    });

    clearTimeout(timeout);

    if (!aiRes.ok) {
      const errTxt = await aiRes.text();
      return send(res, 502, { error: `OpenAI error: ${errTxt.slice(0, 900)}` });
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown = extractText(aiJson);
    if (!summaryMarkdown) {
      return send(res, 502, { error: "OpenAI response had no text.", raw: aiJson });
    }

    // Save to public.summaries
    const { data, error } = await supabaseAdmin
      .from("summaries")
      .insert([
        {
          user_id: userId,
          job_title: jobTitle,
          job_description: jobDescription,
          hm_notes: hmNotes || null,
          recruiter_notes: recruiterNotes || null,
          summary_markdown: summaryMarkdown,
        },
      ])
      .select("id")
      .single();

    if (error) return send(res, 500, { error: `Supabase insert error: ${error.message}` });

    return send(res, 200, { id: data.id });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "OpenAI request timed out" : e?.message || "Server error";
    console.error("generate-summary error:", e);
    return send(res, 500, { error: msg });
  }
}
