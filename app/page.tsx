"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const router = useRouter();

  // If user already has a session, skip homepage → /summaries/new
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace("/summaries/new");
      }
    };
    checkSession();
  }, [router]);

  // Catch magic link (#access_token) and redirect
  useEffect(() => {
    const handleHash = async () => {
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (!error && data?.session) {
          router.replace("/summaries/new");
        }
      }
    };
    handleHash();
  }, [router]);

  return (
    <main className="mx-auto max-w-6xl px-6">
      {/* HERO SECTION */}
      <section className="grid md:grid-cols-2 gap-12 py-20 items-center">
        <div>
          <p className="mb-4 inline-block rounded-full bg-slate-100 px-4 py-1 text-sm text-slate-600">
            Evidence-based. PE-backed. Risk-reducing.
          </p>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Data-backed hiring decisions. <br />
            Lower mis-hire risk.
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Portfolio companies succeed when they hire leaders who deliver value from day one.
            Aligned turns intake notes into <strong>quantified scorecards</strong> and{" "}
            <strong>evidence-backed memos</strong> — so operating partners gain confidence, reduce
            risk, and accelerate growth.
          </p>
          <p className="italic text-slate-500 mb-8">
            Because hiring decisions should be based on evidence, not opinion.
          </p>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="rounded-xl bg-black px-6 py-3 text-white font-medium">
                Log in
              </button>
            </Link>
            <Link href="#how-it-works">
              <button className="rounded-xl border px-6 py-3 text-slate-800 font-medium">
                See How It Works
              </button>
            </Link>
          </div>
        </div>

        {/* PREVIEW CARD */}
        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-slate-500">
            QUANTIFIED & TRANSPARENT MEMO
          </h2>
          <ul className="space-y-3 text-slate-700 text-sm">
            <li>
              <span className="font-semibold">Priority → Evidence (auto-extracted)</span>
            </li>
            <li>
              • Priority: 90-day BI rebuild → Outcome: 60-day dashboard delivery
            </li>
            <li>
              • Priority: Modern stack → Tools: Airflow, dbt, Snowflake, Looker (−28% cost)
            </li>
            <li>
              • Priority: Exec presence → Method: Decision → Evidence → Trade-off framing
            </li>
          </ul>
          <div className="flex gap-4 mt-6">
            <button className="rounded-lg bg-green-100 px-4 py-2 text-green-700 text-sm">
              Quantified fit scorecard
            </button>
            <button className="rounded-lg bg-orange-100 px-4 py-2 text-orange-700 text-sm">
              Transparent risks & mitigations
            </button>
          </div>
          <div className="flex gap-4 mt-6">
            <button className="rounded-xl border px-4 py-2 text-sm text-slate-700">
              Copy Link
            </button>
            <button className="rounded-xl border px-4 py-2 text-sm text-slate-700">
              Export PDF
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}



