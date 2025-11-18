import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Shell } from "@/components/Shell";
import { TopNav } from "@/components/TopNav";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const { data: summaries } = await supabase
    .from("summaries")
    .select("id,candidate_name,role_title,company_name,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-lightGray">
      <Shell className="gap-6 pb-16 pt-8">
        <TopNav fullName={profile?.full_name ?? user.email} />

        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Your candidate summaries</h1>
            <p className="text-slateGray">Evidence-first reports your hiring managers will trust.</p>
          </div>
          <Button asChild>
            <Link href="/summaries/new">Create summary</Link>
          </Button>
        </section>

        <Card className="p-6">
          {summaries && summaries.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {summaries.map((summary) => (
                <Link
                  href={`/summaries/${summary.id}`}
                  key={summary.id}
                  className="flex flex-col gap-2 py-4 transition hover:bg-lightGray/70 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{summary.candidate_name}</p>
                    <p className="text-sm text-slateGray">
                      {summary.role_title} @ {summary.company_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slateGray">
                    <span className="rounded-full bg-lightGray px-3 py-1 text-xs font-semibold capitalize text-primaryBlack">
                      {summary.status}
                    </span>
                    <span>
                      Created {new Date(summary.created_at ?? "").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <p className="text-lg font-semibold">No summaries yet</p>
              <p className="text-slateGray">Create your first summary to turn manager priorities into evidence.</p>
              <Button asChild>
                <Link href="/summaries/new">Create summary</Link>
              </Button>
            </div>
          )}
        </Card>
      </Shell>
    </main>
  );
}
