import Link from "next/link";
import { Card } from "@/components/Card";
import { Shell } from "@/components/Shell";

const steps = [
  {
    title: "Step 1: Start with Evidence",
    text: "Everything begins with the hiring manager’s words. Add candidate notes + resume for context.",
  },
  {
    title: "Step 2: From Words to Decisions",
    text: "Your hiring manager’s priorities become the frame every candidate is judged against.",
  },
  {
    title: "Step 3: Deliver with Confidence",
    text: "Drop your Aligned report straight into the hiring manager’s inbox.",
  },
];

const proofBullets = [
  "Built on executive trust principles",
  "Every report starts with hiring manager evidence",
  "Designed to prevent costly mis-hires",
];

const recruiterWins = ["Instant authority", "Faster cycles", "Premium edge"];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Shell className="gap-16 py-16">
        <header className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slateGray">Aligned</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Hiring decisions need evidence. Recruiters need trust. Meet the bridge.
          </h1>
          <p className="max-w-2xl text-lg text-slateGray">
            Aligned turns messy inputs into decision-ready reports that hiring managers trust.
          </p>
          <Link href="/login" className="inline-flex items-center rounded-full bg-accentOrange px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            Build My First Summary
          </Link>
        </header>

        <section className="grid gap-6 rounded-3xl bg-lightGray px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold">Recruiters speak candidate. Hiring managers speak business. We translate.</h2>
          <p className="mx-auto max-w-4xl text-slateGray">
            The trust gap is real: recruiters push resumes, hiring managers want proof. Aligned bridges the gap by turning
            hiring manager priorities into the lens every candidate is judged against. The result? Reports that speak the
            hiring manager’s language — and make recruiters instantly credible.
          </p>
        </section>

        <section className="grid gap-8">
          <h3 className="text-2xl font-semibold">How It Works</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="h-full p-6">
                <div className="flex h-full flex-col gap-3 text-left">
                  <h4 className="text-lg font-semibold">{step.title}</h4>
                  <p className="text-sm text-slateGray">{step.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 md:gap-10">
          <Card className="p-6">
            <h3 className="text-xl font-semibold">Why Hiring Managers Care</h3>
            <p className="mt-3 text-slateGray">
              From meetings to meaning.
              <br />
              Recruiters stop pitching. You get your words back — organized, weighted, and decision-ready.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold">Why Recruiters Win</h3>
            <ul className="mt-3 space-y-2 text-slateGray">
              {recruiterWins.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accentOrange" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-3">
          <h3 className="text-2xl font-semibold">From meetings to meaning.</h3>
          <p className="text-slateGray">
            Recruiters stop pitching. You get your words back — organized, weighted, and decision-ready.
          </p>
        </section>

        <section className="grid gap-4 rounded-3xl bg-primaryBlack px-6 py-8 text-white">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-accentOrange">
            <span className="h-[1px] flex-1 bg-accentOrange" aria-hidden />
            Proof / Credibility
            <span className="h-[1px] flex-1 bg-accentOrange" aria-hidden />
          </div>
          <h3 className="text-2xl font-semibold">The cost of mis-hires? Millions.</h3>
          <ul className="space-y-2 text-slate-100">
            {proofBullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-accentOrange" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3">
          <h3 className="text-2xl font-semibold">
            Aligned is already powering executive hires in healthcare & finance.
          </h3>
          <p className="text-slateGray">
            We built Aligned first for Weld Recruiting — the trusted partner behind successful placements at:
          </p>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slateGray md:grid-cols-4">
            <span className="rounded-xl bg-lightGray px-4 py-3 text-sm">Logo Placeholder</span>
            <span className="rounded-xl bg-lightGray px-4 py-3 text-sm">Logo Placeholder</span>
            <span className="rounded-xl bg-lightGray px-4 py-3 text-sm">Logo Placeholder</span>
            <span className="rounded-xl bg-lightGray px-4 py-3 text-sm">Logo Placeholder</span>
          </div>
          <p className="text-xs text-slateGray">
            Logos represent companies served by Weld Recruiting using Aligned as part of our process.
          </p>
        </section>

        <footer className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slateGray md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-primaryBlack">Aligned</p>
            <p className="text-slateGray">Evidence-ready reports for confident hiring.</p>
          </div>
          <Link href="/login" className="text-accentOrange hover:underline">
            Start with magic link →
          </Link>
        </footer>
      </Shell>
    </main>
  );
}
