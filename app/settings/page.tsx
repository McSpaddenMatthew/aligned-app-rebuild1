import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { useFormState } from "react-dom";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Shell } from "@/components/Shell";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/Button";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function updateProfile(prevState: { message?: string; error?: string } | undefined, formData: FormData) {
  "use server";
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = formData.get("full_name")?.toString().trim();
  if (!fullName) {
    return { error: "Full name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { message: "Profile updated" };
}

function SettingsForm({ fullName }: { fullName?: string | null }) {
  "use client";
  const [state, formAction] = useFormState(updateProfile, {});

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-2">
        <div className="text-sm font-medium text-primaryBlack">Full name</div>
        <Input name="full_name" defaultValue={fullName ?? ""} placeholder="Avery Recruiter" required />
      </label>
      <Button type="submit">Save</Button>
      {state?.message && <p className="text-sm text-green-700">{state.message}</p>}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export default async function SettingsPage() {
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
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-slateGray">Keep your profile current for more personal reports.</p>
          <div className="mt-6">
            <SettingsForm fullName={profile?.full_name} />
          </div>
        </Card>
      </Shell>
    </main>
  );
}
