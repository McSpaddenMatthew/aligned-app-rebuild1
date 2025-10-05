import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SummaryDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) notFound();

  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm underline decoration-slate-400 underline-offset-4 hover:decoration-slate-800">
          ← Back
        </Link>
      </div>

      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-900">{data.title}</h1>
      {data.candidate && <p className="mb-6 text-slate-600">Candidate: <span className="font-medium text-slate-900">{data.candidate}</span></p>}

      {data.notes && (
        <div className="rounded-xl border bg-white p-4 leading-relaxed text-slate-800 shadow-sm whitespace-pre-wrap">
          {data.notes}
        </div>
      )}
    </main>
  );
}
