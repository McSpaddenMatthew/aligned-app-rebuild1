// pages/api/generateSummary.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { text } = req.body as { text?: string };
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Minimal no-fail call (keeps build/runtime simple)
    const prompt = text ?? "Summarize: Aligned app generates trust-first candidate reports.";
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const summary = result.choices?.[0]?.message?.content ?? "";

    // Example Supabase write (optional; safe to remove)
    await supabase.from("summaries").insert({ summary }).throwOnError();

    return res.status(200).json({ summary });
  } catch (err: any) {
    console.error("generateSummary error:", err?.message || err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

