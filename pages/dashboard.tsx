// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        router.replace("/login");
        return;
      }

      const session = data.session;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "3rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "1rem",
          padding: "2rem 2.5rem",
          boxShadow: "0 20px 45px rgba(15,23,42,0.1)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
              Aligned dashboard
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Signed in as <strong>{user?.email}</strong>
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Sign out
          </button>
        </header>

        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            Next up for MVP
          </h2>
          <ul style={{ fontSize: "0.95rem", color: "#4b5563", paddingLeft: 20 }}>
            <li>Build the “Create candidate summary” flow.</li>
            <li>List summaries that belong only to this logged-in user.</li>
            <li>Add a “shareable link” for each summary.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
