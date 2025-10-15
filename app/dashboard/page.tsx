// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?next=/dashboard');
  }

  // 🔧 Change your dashboard UI/words here
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-slate-600">You’re signed in. Build with confidence.</p>
    </div>
  );
}
