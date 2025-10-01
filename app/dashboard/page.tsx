import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, bounce to login
  if (!session) {
    redirect("/login");
  }

  // Example user info
  const userEmail = session.user.email;

  return (
    <main className="mx-auto max-w-3xl py-12 px-6">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg text-slate-700">
        Welcome back, <span className="font-semibold">{userEmail}</span> 🎉
      </p>

      <section className="mt-8 space-y-4">
        <p>This is your private dashboard area.</p>
        <ul className="list-disc list-inside text-slate-600">
          <li>✅ Protected content goes here</li>
          <li>📊 Candidate summaries</li>
          <li>⚙️ Settings</li>
        </ul>
      </section>
    </main>
  );
}

