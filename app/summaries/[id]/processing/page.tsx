import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { TopNav } from "@/components/TopNav";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface Props {
  params: { id: string };
}

export default async function ProcessingPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const { data: summary } = await supabase
    .from("summaries")
    .select("id,status")
    .eq("user_id", user.id)
    .eq("id", params.id)
    .single();

  if (!summary) {
    redirect("/dashboard");
  }

  if (summary.status === "ready") {
    redirect(`/summaries/${summary.id}`);
  }

  return (
    <main className="min-h-screen bg-lightGray">
      <Shell className="gap-6 pb-16 pt-8">
        <TopNav fullName={profile?.full_name ?? user.email} />
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-accentOrange border-t-transparent" aria-hidden />
          <h1 className="text-2xl font-semibold">Turning evidence into a decision-ready report…</h1>
          <p className="text-slateGray">Stay here. We’ll refresh automatically once your summary is finished.</p>
          <Link href={`/summaries/${summary.id}`} className="text-sm text-accentOrange underline">
            Check status
          </Link>
        </Card>
      </Shell>
    </main>
  );
}
