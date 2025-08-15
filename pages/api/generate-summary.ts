// pages/api/generate-summary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * Required env vars (set in Vercel → Project → Settings → Environment Variables)
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY     (server-only; never expose to client)
 * - OPENAI_API_KEY
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

/** Try to pull plain text from any valid Responses API shape */
function extractText(resp: any): string {
  // Convenience field some SDKs expose
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) {
    return resp.output_text.trim();
  }

  // Generic Responses API: output[] with content[] items (type: "output_text" or similar)
  if (Array.isArray(resp?.output)) {
    const pieces: string[] = [];
    for (const item of resp.output) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c?.text === "string") pieces.push(c.text);
          else if (typeof c === "string") pieces.push(c);
          else if (typeof c?.output_text === "string") pieces.push(c.output_text);
        }
      } else if (typeof item?.output_text === "string") {
        pieces.push(item.output_text);
      }
    }
    const joined = pieces.join("\n").trim();
    if (joined) return joined;
  }

  // Back-compat for chat-style responses
  const msg = resp?.choices?.[0]?.message?.content;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  if (Array.isArray(msg)) {
    const m = msg.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("");
    if (m.trim()) return m.trim();
  }

  return "";
}

/** Helper to send JSON with proper status */
function json(res: NextApiResponse, code: number, payload: any) {
  res.status(code).json(payload);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  // Basic env checks to fail fast in misconfigurations
  if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE) {
    return json(res, 500, { error: "Supabase environment variables are missing" });
  }
  if (!OPENAI_API_KEY) {
    return json(res, 500, { error: "OPENAI_API_KEY is not set" });
  }

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
    // Forward any Authorization header from the browser so we can tie the row to the caller
    global: { headers: { Authorization: req.headers.authorization || "" } },
  });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  try {
    const { jobTitle, jobDescription, hmNotes, recruiterNotes } = (req.body || {}) as {
      jobTitle?: string;
      jobDescription?: string;
      hmNotes?: string;
      recruiterNotes?: string;
    };

    if (!jobTitle || !jobDescription) {
      return json(res, 400, { error: "Missing jobTitle or jobDescription" });
    }

    // Resolve the caller (if they passed a Supabase session token)
    let userId: string | null = null;
    try {
      const { data } = await supabaseUser.auth.getUser();
      if (data?.user) userId = data.user.id;
    } catch {
      // Non-fatal; we can still store a summary without user_id
    }

    // Prompt crafted for concise, manager-ready output
    const prompt = `
You are Aligned, the trust layer between recruiters and hiring managers.
Create a concise, structured candidate/market summary in **Markdown** with EXACTLY these sections:

1) What You Shared – What the Candidate/Market Brings
   - Bullet comparison of role needs vs likely candidate strengths (infer needs from JD/HM notes).

2) Why This Role Is Hard / Market Reality (1–4 bullets)

3) Known Risks & Mitigations
   - Two-column table (Risk | Mitigation), 3–6 rows.

4) Outcomes to Prioritize in Screens (bulleted, measurable)

5) Interview Focus Guide
   - Bullets with pointed probing questions tied to the JD.

Job Title:
${jobTitle}

Job Description / Requirements:
${jobDescription}

HM Notes:
${hmNotes || "(none provided)"}

Recruiter Notes:
${recruiterNotes || "(none provided)"}

Output only the Markdown summary. Do not add headers like "Summary:" or any preamble.
`.trim();

    // Call OpenAI Responses API (no temperature; gpt-5 rejects it)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini", // <-- Your account has this (verified). Change later if desired.
        input: prompt,
        max_output_tokens: 900,
      }),
    });

    clearTimeout(timeout);

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return json(res, 502, { error: `OpenAI error: ${errText.slice(0, 900)}` });
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown = extractText(aiJson);

    if (!summaryMarkdown) {
      return json(res, 502, {
        error: `OpenAI response had no text. Raw: ${JSON.stringify(aiJson).slice(0, 900)}`,
      });
    }

    // Insert into public.summaries and return the new id
    const { data, error } = await supabaseAdmin
      .from("summaries")
      .insert([
        {
          user_id: userId,
          job_title: jobTitle,
          job_description: jobDescription,
          hm_notes: hmNotes ?? null,
          recruiter_notes: recruiterNotes ?? null,
          summary_markdown: summaryMarkdown,
        },
      ])
      .select("id")
      .single();

    if (error) {
      return json(res, 500, { error: `Supabase insert error: ${error.message}` });
    }

    return json(res, 200, { id: data.id });
  } catch (e: any) {
    const msg =
      e?.name === "AbortError"
        ? "OpenAI request timed out"
        : e?.message || "Server error";
    console.error("generate-summary error:", e);
    return json(res, 500, { error: msg });
  }
}
