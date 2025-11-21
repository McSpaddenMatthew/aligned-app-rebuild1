// pages/dashboard.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error(error);
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Still checking
  if (loading || user === undefined) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
        }}
      >
        Loading your dashboard…
      </main>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>
          You’re not signed in.
        </h1>
        <Link href="/login" style={{ color: "#60a5fa", fontSize: 16 }}>
          Go to login
        </Link>
      </main>
    );
  }

  // Logged in – simple, user-specific dashboard
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "2rem",
        color: "white",
      }}
    >
      <header
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Aligned dashboard</h1>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #4b5563",
            background: "transparent",
            color: "white",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>

      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#020617",
          borderRadius: 16,
          padding: "1.75rem",
          boxShadow: "0 20px 40px rgba(15,23,42,0.5)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Your command center
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
          This space is unique to <strong>{user.email}</strong>. In the next
          steps, we’ll plug in:
        </p>
        <ul style={{ fontSize: 14, color: "#e5e7eb", paddingLeft: "1.25rem" }}>
          <li>Candidate summaries you’ve generated.</li>
          <li>Shareable links for each hiring manager.</li>
          <li>Evidence-first views tailored to your PE partners.</li>
        </ul>
      </section>
    </main>
  );
}
