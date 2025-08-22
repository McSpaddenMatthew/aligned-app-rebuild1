// pages/api/diag.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    has_OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    has_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    has_SUPABASE_ANON: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    OPENAI_MODEL: process.env.OPENAI_MODEL || "default (gpt-4o-mini in code)",
    env: process.env.VERCEL_ENV || "unknown",
  });
}
