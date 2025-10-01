// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: summaries, error } = await supabase
    .from("summaries")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-semibold tracking-tight">Aligned</div>
        <nav className="flex items-center gap-3">
          <a
            href="/summaries/new"
            className="rounded-xl bg-[#1E3A8A] text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            New Summary
          </a>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-4 pb-16">
        <h1 className="text-3xl font-semibold tracking-tight">Your Candidate Summaries</h1>
        <p className="mt-2 text-sm text-[#475569]">
          Decision-ready, email-friendly reports—built from what your team already collects.
        </p>

        {!summaries?.length ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] p-6">
            <div className="text-sm font-semibold mb-1">No summaries yet</div>
            <p className="text-sm text-[#475569]">
              Create your first one with five inputs: HM notes, resume, candidate call, JD, and optional intel.
            </p>
            <div className="mt-4">
              <a
                href="/summaries/new"
                className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Create a Summary
              </a>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {summaries.map((s) => (
              <li key={s.id} className="rounded-2xl border border-[#E5E7EB] p-4">
                <div className="font-medium line-clamp-1">{s.title || "Untitled"}</div>
                <div className="text-xs text-[#94A3B8] mt-1">
                  {new Date(s.created_at).toLocaleString()}
                </div>
                {/* You can turn titles into links later: /summaries/[id] */}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-xs text-[#94A3B8]">
          We don’t replace recruiters—we help you get more from the work they already do.
        </p>
      </section>
    </main>
  );
}

