import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";

type Props = {
  summary: {
    id: string;
    job_title: string | null;
    job_description: string | null;
    hm_notes: string | null;
    recruiter_notes: string | null;
    summary_markdown: string | null;
    created_at: string;
  } | null;
};

export default function CaseView({ summary }: Props) {
  if (!summary) {
    return <main style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>Not found</main>;
  }
  return (
    <main style={{maxWidth:900, margin:"24px auto", padding:"0 16px", fontFamily:"ui-sans-serif,system-ui"}}>
      <a href="/dashboard" style={{textDecoration:"none"}}>← Back to Dashboard</a>
      <h1 style={{marginTop:8}}>{summary.job_title || "Untitled role"}</h1>
      <p style={{opacity:.7, marginTop:-8}}>Created {new Date(summary.created_at).toLocaleString()}</p>

      <section style={{marginTop:16}}>
        <h2>Hiring Manager–Ready Report</h2>
        <article
          style={{whiteSpace:"pre-wrap", border:"1px solid #e5e7eb", borderRadius:16, padding:16}}
        >
{summary.summary_markdown}
        </article>
      </section>

      <section style={{marginTop:24}}>
        <h3>Inputs (for reference)</h3>
        <details open>
          <summary style={{cursor:"pointer"}}>Job Description</summary>
          <pre style={{whiteSpace:"pre-wrap"}}>{summary.job_description}</pre>
        </details>
        {summary.hm_notes && (
          <details>
            <summary style={{cursor:"pointer"}}>HM Notes</summary>
            <pre style={{whiteSpace:"pre-wrap"}}>{summary.hm_notes}</pre>
          </details>
        )}
        {summary.recruiter_notes && (
          <details>
            <summary style={{cursor:"pointer"}}>Recruiter Notes</summary>
            <pre style={{whiteSpace:"pre-wrap"}}>{summary.recruiter_notes}</pre>
          </details>
        )}
      </section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", params?.id)
    .single();

  return { props: { summary: data ?? null } };
};
