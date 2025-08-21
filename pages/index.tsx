// pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  // ⬇️ Forward magic-link hashes (/#access_token=...) to the server callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash; // e.g. "#access_token=...&refresh_token=...&type=magiclink"
    if (h && h.length > 2 && /(?:^|&)access_token=|(?:^|&)error=/.test(h.slice(1))) {
      const qs = h.slice(1); // drop "#"
      window.location.replace(`/api/auth/callback?${qs}`);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Aligned — The Trust Layer for Hiring Decisions</title>
        <meta
          name="description"
          content="Aligned turns conversations and resumes into decision-ready reports hiring managers trust — helping Operating Partners and recruiters move faster and avoid costly mis-hires."
        />
      </Head>

      <main className="min-h-screen bg-white text-[#0A0A0A]">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Hiring decisions need evidence. Recruiters need trust. Meet the bridge.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-700">
                You already do the hard part. Aligned makes sure it lands — turning
                conversations and resumes into decision-ready reports hiring managers trust.
              </p>

              <div className="mt-8 flex gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-[#0A0A0A] px-5 py-3 text-white hover:opacity-90"
                >
                  Build My First Summary
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-[#0A0A0A] hover:bg-slate-50"
                >
                  See How It Works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Aligned Exists */}
        <section className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h2 className="text-2xl font-semibold">
                  Recruiters work hard. Hiring managers still hesitate.
                </h2>
              </div>
              <div className="lg:col-span-7">
                <p className="text-slate-700">
                  Your recruiters already run the calls, dig for the details, and craft polished
                  candidate summaries. They put thought into the words, the format, the flow.
                  But here’s the gap: hiring managers still see those as <em>recruiter words</em> — not{" "}
                  <em>their own priorities</em>. The result? Slower decisions. Costly mis-hires. Missed value creation.
                </p>

                <div className="mt-6 rounded-lg bg-[#F1F5F9] p-5">
                  <p className="font-medium">Aligned makes your work undeniable.</p>
                  <p className="mt-2 text-slate-700">
                    We don’t replace your summaries — we elevate them. Every candidate is framed in the hiring
                    manager’s own words, so your summaries get read, trusted, and acted on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">Three steps. Total clarity.</h2>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1E3A8A]">Step 1</p>
                <h3 className="mt-2 text-lg font-semibold">Start with Evidence</h3>
                <p className="mt-2 text-slate-700">
                  Recruiters capture the hiring manager’s priorities and candidate responses.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1E3A8A]">Step 2</p>
                <h3 className="mt-2 text-lg font-semibold">From Words to Decisions</h3>
                <p className="mt-2 text-slate-700">
                  Aligned structures that information into a clear trust report — weighting evidence so hiring managers
                  see <em>their</em> language reflected back.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1E3A8A]">Step 3</p>
                <h3 className="mt-2 text-lg font-semibold">Deliver with Confidence</h3>
                <p className="mt-2 text-slate-700">
                  Paste the report directly into the hiring manager’s inbox. They move faster because it’s their own
                  priorities guiding the decision, not recruiter spin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Hiring Managers Care */}
        <section className="border-t border-slate-200 bg-[#0A0A0A] text-white">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">From meetings to meaning.</h2>
            <p className="mt-4 max-w-3xl text-slate-200">
              Recruiters stop pitching. Hiring managers get their words back — organized, weighted, and decision-ready.
            </p>
          </div>
        </section>

        {/* Why Operating Partners Win */}
        <section className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">From risk to results.</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Consistency across companies",
                  desc: "Recruiters earn trust with the same structured framework.",
                },
                {
                  title: "Faster cycles",
                  desc: "Leadership hires close sooner; value creation starts earlier.",
                },
                {
                  title: "Risk prevention",
                  desc: "Mis-hires avoided before they erode millions in enterprise value.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-slate-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Proof / Credibility */}
        <section className="border-t border-slate-200 bg-[#F1F5F9]">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">The cost of mis-hires? Millions.</h2>
            <p className="mt-4 max-w-3xl text-slate-700">
              Every mis-hire costs more than money — it costs trust, time, and momentum in the companies you back.
            </p>

            <ul className="mt-6 grid list-disc gap-2 pl-5 text-slate-700 md:grid-cols-2">
              <li>Built on executive trust principles.</li>
              <li>Every report starts with hiring manager evidence.</li>
              <li>Designed to prevent costly mis-hires before they happen.</li>
            </ul>
          </div>
        </section>

        {/* Social Proof (logo strip) */}
        <section className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-14 lg:py-16">
            <h2 className="text-2xl font-semibold">
              Aligned is already powering executive hires in healthcare & finance.
            </h2>
            <p className="mt-2 text-slate-700">
              We built Aligned first for Weld Recruiting — the trusted partner behind successful placements at:
            </p>

            <div className="mt-8 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-4">
              {[
                { src: "/logos/client1.png", alt: "Client 1" },
                { src: "/logos/client2.png", alt: "Client 2" },
                { src: "/logos/client3.png", alt: "Client 3" },
                { src: "/logos/client4.png", alt: "Client 4" },
              ].map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center">
                  <img src={logo.src} alt={logo.alt} className="h-9 w-auto opacity-80" />
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Logos represent companies served by Weld Recruiting using Aligned as part of our process.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">Without Aligned vs With Aligned</h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold">Without Aligned</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                  <li>Recruiter summaries read as opinion</li>
                  <li>Hiring managers delay decisions</li>
                  <li>Inconsistent trust across companies</li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold">With Aligned</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
                  <li>Evidence-first, HM-anchored reports</li>
                  <li>Faster, clearer yes/no calls</li>
                  <li>Consistent credibility across companies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Micro-FAQ */}
        <section className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">Quick answers.</h2>
            <dl className="mt-6 grid gap-6 md:grid-cols-2">
              {[
                {
                  q: "Do hiring managers need an account?",
                  a: "No — recruiters deliver reports directly (copy → paste).",
                },
                {
                  q: "Is this replacing recruiters?",
                  a: "No — it elevates their work so it lands with decision-makers.",
                },
                {
                  q: "What if recruiter notes are messy?",
                  a: "That’s what Aligned structures into clarity.",
                },
                {
                  q: "Can reports be customized?",
                  a: "Yes — recruiters can tune before delivering.",
                },
              ].map((item) => (
                <div key={item.q} className="rounded-lg border border-slate-200 p-6">
                  <dt className="font-semibold">{item.q}</dt>
                  <dd className="mt-2 text-slate-700">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-slate-200 bg-[#0A0A0A] text-white">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <h2 className="text-2xl font-semibold">
              Every company you back depends on trust. Build it in minutes.
            </h2>
            <div className="mt-6 flex gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-[#0A0A0A] hover:opacity-90"
              >
                Build My First Summary
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-md border border-slate-500 px-5 py-3 text-white hover:bg-[#1E3A8A]"
              >
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-600">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <p>© {new Date().getFullYear()} Aligned</p>
              <nav className="flex gap-5">
                <Link href="/terms" className="hover:underline">Terms</Link>
                <Link href="/privacy" className="hover:underline">Privacy</Link>
                <Link href="/security" className="hover:underline">Security</Link>
                <span className="text-slate-500">Built by Weld Recruiting</span>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}



