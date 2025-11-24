import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Shell } from '@/components/Shell';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

async function getProfile() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    fullName: data?.full_name ?? '',
  };
}

async function updateProfile(formData: FormData) {
  'use server';

  const supabase = createSupabaseServerClient();
  const fullName = (formData.get('full_name') as string | null) ?? '';

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
  });

  revalidatePath('/settings');
}

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <Shell>
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update the details shown on your Aligned dashboard and reports.
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <form action={updateProfile} className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile.fullName}
                placeholder="e.g., Jordan Lee"
              />
              <p className="mt-1 text-xs text-slate-500">
                This appears on your dashboard and in the email footer when you
                share a report.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded-lg border border-slate-900 px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Save changes
            </button>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
