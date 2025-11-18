import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Shell } from "@/components/Shell";
import { TopNav } from "@/components/TopNav";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SummaryReport } from "@/lib/types";

interface Props {
  params: { id: string };
}

function buildShareUrl(token?: string | null) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return token ? `${base}/share/${token}` : base;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">{children}</div>
    </div>
  );
}

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard not available"));
}

function ShareLinkButton({ url }: { url: string }) {
  "use client";
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy}>
      {copied ? "Link copied" : "Copy share link"}
    </Button>
  );
}

export default async function SummaryDetailPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const { data: summary } = await supabase
    .from("summaries")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", params.id)
    .single();

  if (!summary) {
    redirect("/dashboard");
  }

  if (summary.status !== "ready") {
    redirect(`/summaries/${summary.id}/processing`);
  }

  const report = (summary.report ?? {}) as SummaryReport;
  const shareUrl = buildShareUrl(summary.share_token ?? undefined);

  return (
    <main className="min-h-screen bg-lightGray">
      <Shell className="gap-6 pb-16 pt-8">
        <TopNav fullName={profile?.full_name ?? user.email} />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slateGray">Candidate Summary</p>
            <h1 className="text-3xl font-semibold">{summary.candidate_name}</h1>
            <p className="text-slateGray">{summary.role_title} @ {summary.company_name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShareLinkButton url={shareUrl} />
            <Button asChild variant="ghost">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
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
