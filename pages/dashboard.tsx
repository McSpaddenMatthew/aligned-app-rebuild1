import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        router.replace("/login");
        return;
      }

      const session = data?.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
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
      <div style={{ display: "flex", justifyContent: "center", marginTop: 120 }}>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
        Aligned dashboard
      </h1>
      <p style={{ marginBottom: 24 }}>
        Signed in as{" "}
        <strong>{user?.email ?? "unknown user"}</strong>
      </p>

      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          Coming soon
        </h2>
        <p style={{ marginBottom: 8 }}>
          This is your placeholder dashboard. Next steps will be:
        </p>
        <ul>
          <li>Create a new candidate summary</li>
          <li>View past summaries</li>
          <li>Share summaries with hiring managers</li>
        </ul>
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 18px",
          borderRadius: 6,
          border: "1px solid #0A0A0A",
          background: "#0A0A0A",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}
