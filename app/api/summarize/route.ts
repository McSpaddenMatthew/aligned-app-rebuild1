// app/api/summarize/route.ts
import { NextResponse } from 'next/server';
import { openai, OPENAI_MODEL, OPENAI_TIMEOUT_MS, ensureOpenAIEnv } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    ensureOpenAIEnv();

    const { candidate_name, raw_notes, job_context } = await req.json();
    if (!candidate_name || !raw_notes) {
      return NextResponse.json(
        { error: 'candidate_name and raw_notes are required' },
        { status: 400 }
      );
    }

    const instructions = [
      'You write decision-ready candidate summaries for executive hiring managers.',
      'Output MUST be plain text only. No markdown, no HTML.',
      'Use concise bullets. Prioritize facts and outcomes, not fluff.',
      'Follow this exact section order and headings:',
      '1) What You Shared – What the Candidate Brings',
      '2) Why This Candidate Was Selected',
      '3) Known Risks & Mitigations',
      '4) Outcomes Delivered',
      `5) How ${candidate_name} Frames Data for Leadership Decisions`,
      'Keep it short, skimmable, and copy-pasteable into email.'
    ].join(' ');

    const prompt = [
      `Hiring context (optional): ${job_context || '(none provided)'}`,
      `Candidate name: ${candidate_name}`,
      'Raw recruiter notes (verbatim):',
      raw_notes,
      '',
      'Transform the notes into the 5-section trust format above.',
      'Do not invent facts; infer only if strongly implied.',
      'Return only the 5 sections, nothing else.'
    ].join('\n');

    const resp = await openai.responses.create({
      model: OPENAI_MODEL || 'gpt-4o-mini',
      input: prompt,
      instructions,
      temperature: 0.4,
      max_output_tokens: 900,
      timeout: OPENAI_TIMEOUT_MS || 60000
    });

    const text =
      (resp as any).output_text ||
      ((resp as any).output?.[0]?.content?.[0]?.text ?? '');

    if (!text) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    return NextResponse.json({ notes: String(text).trim() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
