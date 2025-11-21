import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: summaries } = await supabase
    .from("summaries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 32 }}>
      <h1>Welcome back, {user.email}</h1>

      {!summaries || summaries.length === 0 ? (
        <p>No summaries yet. Start by creating your first report.</p>
      ) : (
        <ul>
          {summaries.map((s) => (
            <li key={s.id}>
              <strong>{s.candidate_name}</strong> — {s.role_title}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
