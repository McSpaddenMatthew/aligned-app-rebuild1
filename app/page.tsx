"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      setBusy(true);
      supabase.auth.getSession().then(() => {
        router.replace("/summaries/new");
      });
    }
  }, [router]);

  return (
    <section className="py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          Hiring decisions need evidence.<br/>Recruiters need trust.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Aligned turns messy inputs into decision-ready reports executives trust.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="/login"
            className="inline-flex items-center rounded-2xl border px-4 py-2 text-sm hover:bg-slate-50"
          >
            {busy ? "Signing you in…" : "Log in with email"}
          </a>
          <a
            href="/summaries"
            className="inline-flex items-center rounded-2xl px-4 py-2 text-sm underline underline-offset-4"
          >
            View dashboard
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border p-4">
            <div className="text-sm font-medium">Start with Evidence</div>
            <div className="mt-1 text-slate-600 text-sm">Use the hiring manager’s words first.</div>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="text-sm font-medium">From Words to Decisions</div>
            <div className="mt-1 text-slate-600 text-sm">We frame every candidate against priorities.</div>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="text-sm font-medium">Deliver with Confidence</div>
            <div className="mt-1 text-slate-600 text-sm">Drop a report execs act on—fast.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

