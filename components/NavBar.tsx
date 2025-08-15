import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function useSupabaseUser() {
  const [user, setUser] = useState<any | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  return user;
}

export default function NavBar() {
  const router = useRouter();
  const user = useSupabaseUser();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <nav style={{ display: "flex", gap: 16, padding: 16 }}>
      <Link href="/">Aligned</Link>
      <div style={{ marginLeft: "auto" }}>
        {user ? <button onClick={logout}>Log out</button> : <Link href="/login">Log in</Link>}
      </div>
    </nav>
  );
}


