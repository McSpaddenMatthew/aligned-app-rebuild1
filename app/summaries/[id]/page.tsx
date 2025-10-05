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
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <Link href="/dashboard" className="underline">← Back</Link>
      <h1 className="text-2xl font-semibold">{data.title}</h1>
      {data.candidate && <p className="opacity-80">Candidate: {data.candidate}</p>}
      {data.notes && (
        <div className="border rounded p-3 whitespace-pre-wrap">{data.notes}</div>
      )}
    </main>
  );
}
