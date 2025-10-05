import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type Row = { id: string; title: string; created_at: string };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login?redirectTo=/dashboard");

  const { data: rows } = await supabase
    .from("summaries")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <Link href="/summaries/new">
          <Button>Create Summary</Button>
        </Link>
      </div>

      {!rows?.length && (
        <p className="rounded-xl border border-dashed bg-white p-6 text-slate-600">
          No summaries yet. Click <Link className="underline" href="/summaries/new">Create Summary</Link> to add your first one.
        </p>
      )}

      <ul className="space-y-3">
        {rows?.map((r: Row) => (
          <li
            key={r.id}
            className="group flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="min-w-0">
              <div className="truncate text-base font-medium text-slate-900">{r.title || "Untitled"}</div>
              <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <Link
              href={`/summaries/${r.id}`}
              className="text-sm font-medium underline decoration-slate-400 decoration-2 underline-offset-4 group-hover:decoration-slate-800"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
