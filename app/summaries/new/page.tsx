"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setLoading(false);
    });
  }, [router]);

  if (loading) return <main className="p-6"><p>Loading…</p></main>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">New Candidate Summary</h1>
      {/* your form/UI here */}
    </main>
  );
}

