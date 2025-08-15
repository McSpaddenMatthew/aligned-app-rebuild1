import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace("/"); // or "/dashboard"
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  return <p style={{ padding: 24 }}>Signing you in…</p>;
}
