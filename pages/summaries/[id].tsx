import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Summary = {
  id: string;
  title: string;
  candidate_name: string | null;
  notes: string | null;
  summary_text: string | null;
  created_at: string;
};

type Props = { summary: Summary };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: { destination: "/login?next=" + ctx.resolvedUrl, permanent: false },
    };
  }

  const id = ctx.params?.id as string;
  const { data, error } = await supabase
    .from<Summary>("summaries")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (error || !data) return { notFound: true };
  return { props: { summary: data } };
};

export default function SummaryDetail({ summary }: Props) {
  return (
    <>
      <Head><title>{summary.title} • Aligned</title></Head>
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{summary.title}</h1>
            <Link href="/summaries" className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Back</Link>
          </div>

          <div className="mb-4 text-sm text-[#475569]">
            {summary.candidate_name ? `${summary.candidate_name} • ` : ""}
            {new Date(summary.created_at).toLocaleString()}
          </div>

          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-medium">Summary</h2>
            <pre className="whitespace-pre-wrap text-sm">
{summary.summary_text || "No summary generated yet."}
            </pre>
          </section>

          {summary.notes && (
            <section className="mt-6 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="mb-2 text-base font-medium">Source Notes</h3>
              <pre className="whitespace-pre-wrap text-sm text-[#475569]">
{summary.notes}
              </pre>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
