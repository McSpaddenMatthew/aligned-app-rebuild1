// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function DashboardPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, send them back to login
  if (!user) {
    redirect("/login");
  }

  // This is where their “unique” dashboard can be built out
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <div
        style={{
          padding: 32,
          borderRadius: 16,
          border: "1px solid #ddd",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Aligned Dashboard</h1>
        <p style={{ marginBottom: 16 }}>
          Signed in as <strong>{user.email}</strong>
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
          This dashboard is unique to your account. Every candidate summary,
          report, and note you create will be tied to your user ID:
        </p>

        <code
          style={{
            display: "block",
            padding: 12,
            background: "#f9fafb",
            borderRadius: 8,
            fontSize: 12,
            wordBreak: "break-all",
          }}
        >
          {user.id}
        </code>

        <p style={{ fontSize: 12, marginTop: 16, color: "#6b7280" }}>
          Next step: we’ll wire this up so each summary you create is stored in
          Supabase under this user ID.
        </p>
      </div>
    </main>
  );
}
