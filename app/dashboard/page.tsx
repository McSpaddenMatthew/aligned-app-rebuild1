import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Row = { id: string; title: string; created_at: string };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login?redirectTo=/dashboard");

  const { data: rows, error } = await supabase
    .from("summaries")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/summaries/new"
          className="border rounded px-3 py-2"
        >
          Create Summary
        </Link>
      </div>

      {!rows?.length && (
        <p>No summaries yet. Click <Link className="underline" href="/summaries/new">Create Summary</Link> to start.</p>
      )}

      <ul className="space-y-3">
        {rows?.map((r: Row) => (
          <li key={r.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-sm opacity-70">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <Link href={`/summaries/${r.id}`} className="underline">Open</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
