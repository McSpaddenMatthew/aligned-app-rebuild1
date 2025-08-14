import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for insert
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { jobDescription, hiringManagerNotes, candidateData } = req.body;

    if (!jobDescription || !candidateData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Call OpenAI to generate the summary
    const prompt = `
      Job Description: ${jobDescription}
      Hiring Manager Notes: ${hiringManagerNotes || 'N/A'}
      Candidate Data: ${JSON.stringify(candidateData)}

      Please write a concise, trust-focused candidate summary for a hiring manager.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert recruiter who writes concise, clear candidate summaries.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || 'No summary generated.';

    // Insert into Supabase
    const { data, error } = await supabase
      .from('summaries')
      .insert([{ job_description: jobDescription, summary: aiResponse }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Database insert error' });
    }

    res.status(200).json({ id: data.id, summary: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
