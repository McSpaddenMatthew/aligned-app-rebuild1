import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Optional user-aware client (reads bearer token to attach user_id)
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: req.headers.get("authorization") || "" } },
  });

  // Admin client (bypasses RLS) for writes
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  try {
    const { jobTitle, jobDescription, hmNotes, recruiterNotes } = await req.json();

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "Missing jobTitle or jobDescription" },
        { status: 400 }
      );
    }
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    // Try to bind row to the calling user (if a token is present)
    let userId: string | null = null;
    try {
      const { data, error } = await supabaseUser.auth.getUser();
      if (!error && data?.user) userId = data.user.id;
    } catch {
      // ignore — it's fine to insert without user_id
    }

    // ---------- Build prompt ----------
    const prompt = `
You are Aligned, the trust layer between recruiters and hiring managers.
Create a concise, structured hiring-manager–ready report.

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

Keep it crisp. No fluff.`.trim();

    // ---------- OpenAI (Responses API) ----------
    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: prompt,
        // NOTE: Do not pass temperature; this model rejects it in Responses API.
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return NextResponse.json(
        { error: `OpenAI error: ${txt.slice(0, 800)}` },
        { status: 502 }
      );
    }

    const aiJson = await aiRes.json();
    const summaryMarkdown: string =
      aiJson?.output_text || aiJson?.choices?.[0]?.message?.content || "[No output]";

    // ---------- Save to Supabase (bypass RLS with service role) ----------
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
      return NextResponse.json(
        { error: `Supabase insert error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    console.error("generate-summary error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
