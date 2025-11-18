import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { Shell } from "@/components/Shell";
import { createSupabaseServiceRoleClient } from "@/lib/supabaseServer";
import { SummaryReport } from "@/lib/types";

interface Props {
  params: { token: string };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">{children}</div>
    </div>
  );
}

export default async function SharePage({ params }: Props) {
  const supabase = createSupabaseServiceRoleClient();
  const { data: summary } = await supabase
    .from("summaries")
    .select("*")
    .eq("share_token", params.token)
    .single();

  if (!summary) {
    notFound();
  }

  const report = (summary.report ?? {}) as SummaryReport;

  return (
    <main className="min-h-screen bg-lightGray">
      <Shell className="gap-6 pb-16 pt-10">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slateGray">Prepared for you with Aligned</p>
          <h1 className="text-3xl font-semibold">{summary.candidate_name}</h1>
          <p className="text-slateGray">{summary.role_title} @ {summary.company_name}</p>
        </div>

        <Card className="space-y-6 p-6">
          <Section title="Candidate Header">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slateGray">Candidate</p>
                <p className="text-lg font-semibold">{summary.candidate_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slateGray">Role</p>
                <p className="text-lg font-semibold">{summary.role_title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slateGray">Company</p>
                <p className="text-lg font-semibold">{summary.company_name}</p>
              </div>
            </div>
          </Section>

          <Section title="What You Shared – What the Candidate Brings">
            <div className="grid gap-3">
              {(report.whatYouSharedVsWhatCandidateBrings ?? []).map((item, index) => (
                <div
                  key={`${item.priority}-${index}`}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-lightGray/50 p-4 md:grid-cols-2"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slateGray">Hiring manager priority</p>
                    <p className="font-semibold">{item.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slateGray">Candidate evidence</p>
                    <p className="text-sm text-primaryBlack">{item.evidence}</p>
                  </div>
                </div>
              ))}
              {(report.whatYouSharedVsWhatCandidateBrings ?? []).length === 0 && (
                <p className="text-sm text-slateGray">No evidence captured yet.</p>
              )}
            </div>
          </Section>

          <Section title="Evidence Summary">
            <ul className="list-disc space-y-2 pl-5 text-sm text-primaryBlack">
              {(report.evidenceSummary ?? ["Awaiting generated evidence summary."]).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Considerations & Watchouts">
            <ul className="list-disc space-y-2 pl-5 text-sm text-primaryBlack">
              {(report.considerationsAndWatchouts ?? ["No watchouts captured."]).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Outcomes & Track Record">
            <ul className="list-disc space-y-2 pl-5 text-sm text-primaryBlack">
              {(report.outcomesAndTrackRecord ?? ["Pending outcomes."]).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title={`How ${summary.candidate_name} Frames Data for Leadership Decisions`}>
            <ul className="list-disc space-y-2 pl-5 text-sm text-primaryBlack">
              {(report.leadershipDataFraming ?? ["Pending framing guidance."]).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Resume Note & Scheduling Options">
            <ul className="list-disc space-y-2 pl-5 text-sm text-primaryBlack">
              {(report.resumeNoteAndSchedulingOptions ?? ["Scheduling options will appear here."]).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Section>
        </Card>
      </Shell>
    </main>
  );
}
