import type { NextApiRequest, NextApiResponse } from "next";
// If you have the "@/lib" alias, keep these lines:
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { buildTrustPrompt } from "@/lib/prompts/trustReport";
// If you DON'T have that alias, replace with:
// import { openai, OPENAI_MODEL } from "../../lib/openai";
// import { buildTrustPrompt } from "../../lib/prompts/trustReport";

function extractJSON(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return JSON.parse(text.slice(start, end + 1));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { candidateName, roleTitle, industry, hmQuotes, candidateNotes, resumeText } = req.body || {};
  if (!candidateName || !roleTitle || !industry || !hmQuotes || !candidateNotes) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = buildTrustPrompt({ candidateName, roleTitle, industry, hmQuotes, candidateNotes, resumeText });

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: prompt,
      temperature: 0.3,
    });
    // @ts-ignore
    const raw = response.output_text ?? JSON.stringify(response);
    const json = extractJSON(raw);
    return res.status(200).json({ report: json });
  } catch (err: any) {
    console.error("generate API error:", err);
    return res.status(500).json({ error: err?.message || "Generation failed" });
  }
}
