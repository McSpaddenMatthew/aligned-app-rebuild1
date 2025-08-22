import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      ok: false,
      error: "Missing OPENAI_API_KEY",
      ts: new Date().toISOString(),
    });
  }

  res.status(200).json({
    ok: true,
    model: process.env.OPENAI_MODEL || "(none set)",
    hasKey: true,
    ts: new Date().toISOString(),
  });
}
