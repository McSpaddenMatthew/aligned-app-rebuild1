import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SummaryReport } from "@/lib/types";

const systemPrompt = `You are an assistant that turns hiring manager priorities and recruiter notes into a JSON summary.
Respond ONLY with JSON and follow this schema exactly:
{
  "candidateHeader": object,
  "whatYouSharedVsWhatCandidateBrings": [ { "priority": string, "evidence": string } ],
  "evidenceSummary": string[],
  "considerationsAndWatchouts": string[],
  "outcomesAndTrackRecord": string[],
  "leadershipDataFraming": string[],
  "resumeNoteAndSchedulingOptions": string[]
}
Tone: neutral, evidence-first, trust-building. Use the hiring manager wording where possible.`;

export async function POST(request: NextRequest) {
  try {
    const { summaryId, hmText, notesText } = await request.json();
    if (!summaryId) {
      return NextResponse.json({ error: "summaryId is required" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: summary } = await supabase.from("summaries").select("*").eq("id", summaryId).single();
    if (!summary || summary.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenAI key" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Hiring manager priorities:\n${hmText || ""}\nRecruiter notes:\n${notesText || ""}`,
        },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0].message?.content ?? "{}";
    const parsedReport = JSON.parse(content) as SummaryReport;

    const { data: updated } = await supabase
      .from("summaries")
      .update({ report: parsedReport, status: "ready" })
      .eq("id", summaryId)
      .select()
      .single();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error generating summary", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
