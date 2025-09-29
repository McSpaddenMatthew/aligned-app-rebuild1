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

  // Catch magic link hash and redirect
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
    <main className="mx-auto max-w-5xl px-6">
      {/* HERO */}
      <section className="text-center py-20">
        <p className="mb-4 inline-block rounded-full bg-slate-100 px-4 py-1 text-sm text-slate-600">
          Built for recruiters. Trusted by hiring managers.
        </p>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Hiring decisions need evidence. <br />
          Recruiters need trust. Meet the bridge.
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Aligned turns messy inputs into decision-ready reports that hiring managers trust.
        </p>
        <div className="flex justify-center gap-4">
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
      </section>

      {/* WHY ALIGNED EXISTS */}
      <section id="the-problem" className="py-20 border-t">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          Recruiters speak candidate. Hiring managers speak business. We translate.
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center">
          The trust gap is real: recruiters push resumes, hiring managers want proof. Aligned bridges the gap by turning hiring manager priorities into the lens every candidate is judged against.
          The result? Reports that speak the hiring manager’s language — and make recruiters instantly credible.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 border-t">
        <h2 className="text-3xl font-semibold mb-12 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 1: Start with Evidence</h3>
            <p className="text-slate-600">
              Everything begins with the hiring manager’s words. Add candidate notes + resume for context.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 2: From Words to Decisions</h3>
            <p className="text-slate-600">
              Your hiring manager’s priorities become the frame every candidate is judged against.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Step 3: Deliver with Confidence</h3>
            <p className="text-slate-600">
              Drop your Aligned report straight into the hiring manager’s inbox.
            </p>
          </div>
        </div>
      </section>

      {/* WHY HIRING MANAGERS CARE */}
      <section className="py-20 border-t">
        <h2 className="text-3xl font-semibold mb-6 text-center">From meetings to meaning</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center">
          Recruiters stop pitching. You get your words back — organized, weighted, and decision-ready.
        </p>
      </section>

      {/* WHY RECRUITERS WIN */}
      <section className="py-20 border-t">
        <h2 className="text-3xl font-semibold mb-6 text-center">From ignored to indispensable</h2>
        <ul className="text-lg text-slate-700 max-w-xl mx-auto space-y-2 list-disc list-inside">
          <li>Instant authority</li>
          <li>Faster cycles</li>
          <li>Premium edge</li>
        </ul>
      </section>

      {/* PROOF / CREDIBILITY */}
      <section id="proof" className="py-20 border-t">
        <h2 className="text-3xl font-semibold mb-6 text-center">The cost of mis-hires? Millions.</h2>
        <ul className="text-lg text-slate-700 max-w-xl mx-auto space-y-2 list-disc list-inside">
          <li>Built on executive trust principles</li>
          <li>Every report starts with hiring manager evidence</li>
          <li>Designed to prevent costly mis-hires</li>
        </ul>
      </section>

      {/* SOCIAL PROOF / LOGOS */}
      <section className="py-20 border-t text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Aligned is already powering executive hires in healthcare & finance.
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          We built Aligned first for Weld Recruiting — the trusted partner behind successful placements at:
        </p>
        <div className="flex justify-center gap-8 grayscale opacity-80">
          <div className="h-12 w-32 bg-slate-200 rounded" />
          <div className="h-12 w-32 bg-slate-200 rounded" />
          <div className="h-12 w-32 bg-slate-200 rounded" />
        </div>
        <p className="text-sm text-slate-500 mt-6">
          Logos represent companies served by Weld Recruiting using Aligned as part of our process.
        </p>
      </section>
    </main>
  );
}



