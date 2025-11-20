import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              Your Aligned Dashboard
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Signed in as <strong>{user?.email}</strong>
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "white",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </header>

        <main>
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Coming soon
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              This is where your candidate summaries and hiring-manager-ready
              reports will live. For now, you’re successfully signed in and
              wired to Supabase auth.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
