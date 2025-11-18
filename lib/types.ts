export type SummaryStatus = "draft" | "ready";

export interface SummaryReport {
  candidateHeader?: Record<string, unknown>;
  whatYouSharedVsWhatCandidateBrings?: Array<{
    priority: string;
    evidence: string;
  }>;
  evidenceSummary?: string[];
  considerationsAndWatchouts?: string[];
  outcomesAndTrackRecord?: string[];
  leadershipDataFraming?: string[];
  resumeNoteAndSchedulingOptions?: string[];
}

export interface SummaryRow {
  id: string;
  user_id: string;
  candidate_name: string;
  role_title: string;
  company_name: string;
  status: SummaryStatus;
  hm_name?: string | null;
  share_token?: string | null;
  report?: SummaryReport | null;
  raw_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}
