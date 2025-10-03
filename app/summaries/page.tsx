import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export default async function SummariesPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Your Summaries</h1>
        <p className="mt-2 text-slate-600">Please <Link href="/login" className="underline">log in</Link> to view your data.</p>
      </section>
    );
  }

  const { data: summaries } = await supabase
    .from("summaries")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Your Summaries</h1>
        <Link href="/summaries/new" className="rounded-xl border px-3 py-2 hover:bg-slate-50 text-sm">
          + New
        </Link>
      </div>

      <ul className="mt-6 grid gap-3">
        {summaries?.length ? summaries.map((s) => (
          <li key={s.id} className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/summaries/${s.id}`} className="font-medium hover:underline">
                  {s.title || "Untitled"}
                </Link>
                <div className="text-xs text-slate-500">{new Date(s.created_at).toLocaleString()}</div>
              </div>
              <Link
                href={`/summaries/${s.id}`}
                className="text-sm rounded-xl border px-3 py-1.5 hover:bg-slate-50"
              >
                Open
              </Link>
            </div>
          </li>
        )) : (
          <li className="rounded-2xl border p-4 text-slate-600">
            No summaries yet. <Link className="underline" href="/summaries/new">Create your first.</Link>
          </li>
        )}
      </ul>
    </section>
  );
}


