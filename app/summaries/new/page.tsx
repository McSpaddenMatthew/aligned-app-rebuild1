import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Shell } from "@/components/Shell";
import { TopNav } from "@/components/TopNav";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";

function createShareToken() {
  return Math.random().toString(36).substring(2, 10);
}

async function createSummaryAction(formData: FormData) {
  "use server";

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const candidateName = formData.get("candidate_name")?.toString().trim();
  const roleTitle = formData.get("role_title")?.toString().trim();
  const companyName = formData.get("company_name")?.toString().trim();
  const hmName = formData.get("hm_name")?.toString().trim();
  const hmText = formData.get("hm_text")?.toString().trim() ?? "";
  const notesText = formData.get("notes_text")?.toString().trim() ?? "";

  if (!candidateName || !roleTitle || !companyName) {
    throw new Error("Candidate, role, and company are required");
  }

  const { data, error } = await supabase
    .from("summaries")
    .insert({
      user_id: user.id,
      candidate_name: candidateName,
      role_title: roleTitle,
      company_name: companyName,
      hm_name: hmName,
      raw_notes: notesText,
      status: "draft",
      share_token: createShareToken(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create summary");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const cookieHeader = cookies()
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  await fetch(`${baseUrl}/api/summaries/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ summaryId: data.id, hmText, notesText }),
  });

  revalidatePath("/dashboard");
  redirect(`/summaries/${data.id}/processing`);
}

function SummaryForm() {
  "use client";

  return (
    <form action={createSummaryAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-sm font-medium text-primaryBlack">Hiring manager name</div>
          <Input name="hm_name" placeholder="Jordan" />
        </label>
        <label className="space-y-2">
          <div className="text-sm font-medium text-primaryBlack">Role title</div>
          <Input name="role_title" placeholder="Head of Data" required />
        </label>
        <label className="space-y-2">
          <div className="text-sm font-medium text-primaryBlack">Company</div>
          <Input name="company_name" placeholder="Weld Recruiting" required />
        </label>
        <label className="space-y-2">
          <div className="text-sm font-medium text-primaryBlack">Candidate name</div>
          <Input name="candidate_name" placeholder="Avery Case" required />
        </label>
      </div>

      <label className="space-y-2">
        <div className="text-sm font-medium text-primaryBlack">What did the hiring manager say they care about most?</div>
        <TextArea name="hm_text" placeholder="List the hiring manager priorities and language." rows={4} required />
      </label>

      <label className="space-y-2">
        <div className="text-sm font-medium text-primaryBlack">Your notes / call transcript (paste or rough notes)</div>
        <TextArea name="notes_text" placeholder="Paste transcript or bullet notes." rows={6} />
      </label>

      <Button type="submit">Generate report</Button>
    </form>
  );
}

export default async function NewSummaryPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  return (
    <main className="min-h-screen bg-lightGray">
      <Shell className="gap-6 pb-16 pt-8">
        <TopNav fullName={profile?.full_name ?? user.email} />
        <Card className="p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Create summary</h1>
            <p className="text-sm text-slateGray">
              Capture the hiring manager’s lens and your notes. Aligned will handle the report.
            </p>
          </div>
          <div className="mt-6">
            <SummaryForm />
          </div>
        </Card>
      </Shell>
    </main>
  );
}
