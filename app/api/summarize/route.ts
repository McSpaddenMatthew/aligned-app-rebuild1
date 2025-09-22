// app/api/summarize/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime (OpenAI SDK is Node-targeted)

/**
 * POST /api/summarize
 * Body: { text: string }
 */
export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // Create the client inside the handler so it doesn't run at build time
    const client = new OpenAI({ apiKey });

    // ---- Replace this with your actual call/params ----
    // Example using Responses API (compatible with latest SDKs)
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "text", text: `Summarize succinctly:\n\n${text}` },
          ],
        },
      ],
    });

    // Pull text safely
    const output =
      (response.output_text ?? "").trim() ||
      "No summary generated.";

    return NextResponse.json({ summary: output });
  } catch (err: any) {
    console.error("Summarize route error:", err);
    return NextResponse.json(
      { error: "Failed to summarize." },
      { status: 500 }
    );
  }
}

