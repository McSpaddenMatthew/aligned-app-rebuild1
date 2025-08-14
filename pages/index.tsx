import Head from "next/head";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5, ease: "easeOut", delay: i * 0.08 },
});

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduce;
}

export default function Home() {
  const reduce = useReduceMotion();
  const maybe = (cfg: any) => (reduce ? {} : cfg);

  return (
    <>
      <Head>
        <title>Aligned — Recruiter trust, delivered</title>
        <meta name="description" content="Aligned turns your recruiter calls into polished, data-backed candidate summaries hiring managers trust." />
      </Head>

      {/* HERO */}
      <section className="section-pad">
        <div className="container-tight grid md:grid-cols-2 gap-10 items-center">
          <motion.div {...maybe(fadeUp())}>
            <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-5">
              Trust-first recruiting
            </div>
            <h1 className="h1">Recruiters win on trust. <br className="hidden md:block" />Aligned helps you build it.</h1>
            <p className="lead mt-4">
              Aligned turns your recruiter calls into polished, data-backed candidate summaries hiring managers understand and trust — without the follow-up dance.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#cta" className="btn btn-primary">Request Access</a>
              <a href="#how" className="btn btn-ghost">See how it works</a>
            </div>
            <p className="mt-4 text-sm text-gray-500">“Built for recruiters. Trusted by hiring managers.”</p>
          </motion.div>

          <motion.div className="card" {...maybe(fadeUp(0.2))}>
            <div className="text-sm text-gray-500 mb-3">Sample Candidate Summary</div>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 p-4">
                <div className="font-semibold">What You Shared – What the Candidate Brings</div>
                <ul className="mt-2 text-sm list-disc ml-5 text-gray-600">
                  <li>Leadership in Data Strategy — 10+ yrs | Timestamped quote</li>
                  <li>Value-Based Care — payer + provider | Quote</li>
                  <li>Exec-ready storytelling | Quote</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-2">Outcomes Delivered</div>
                  <ul className="text-sm list-disc ml-5 text-gray-600">
                    <li>Reduced time-to-insight 38%</li>
                    <li>Consolidated BI stack across 9 teams</li>
                    <li>$4.2M annual cost avoidance</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2">Known Risks & Mitigations</div>
                  <ul className="text-sm list-disc ml-5 text-gray-600">
                    <li>Limited Epic experience → pair with SME first 30 days</li>
                    <li>Prefers hybrid cadence → align on travel upfront</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <div className="font-semibold">How They Frame Data for Leadership Decisions</div>
                <p className="text-sm text-gray-600 mt-2">Clear narrative → metric impact → tradeoffs. Screenshot-quality pull-quotes with timestamps.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BAR */}
      <motion.section aria-label="Trust logos" className="py-10" {...maybe(fadeUp())}>
        <div className="container-tight opacity-80">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">Trusted by leaders from</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-100" />)}
          </div>
        </div>
      </motion.section>

      {/* WHY */}
      <section id="why" className="section-pad bg-white">
        <div className="container-tight">
          <h2 className="h2">Why hiring feels broken</h2>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Hiring managers don’t buy speed. They buy confidence. Aligned makes every candidate submission an executive-grade brief that answers “why this person” in one page.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              ["Executive clarity", "One-page briefs tuned for VP/C-suite attention."],
              ["Proof over hype", "Timestamped quotes, outcomes, risks & mitigations."],
              ["Fewer back-and-forths", "Decisions move faster when the brief is trusted."],
            ].map(([t, d], i) => (
              <motion.div key={t} className="card" {...maybe(fadeUp(i))}>
                <div className="text-lg font-semibold">{t}</div>
                <p className="mt-2 text-gray-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="section-pad">
        <div className="container-tight">
          <h2 className="h2">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              ["Drop in your inputs", "JD, HM call notes, recruiter notes, candidate call, resume."],
              ["Aligned assembles the brief", "Trust-first structure, clean visuals, exec-ready language."],
              ["Ship with confidence", "Share or paste directly into your workflow. Less friction, more trust."],
            ].map(([t, d], i) => (
              <motion.div key={t} className="card" {...maybe(fadeUp(i))}>
                <div className="text-lg font-semibold">{t}</div>
                <p className="mt-2 text-gray-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="section-pad bg-white">
        <div className="container-tight">
          <h2 className="h2">Outcomes that speak for themselves</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              ["3× faster decisions", "because stakeholders understand tradeoffs instantly"],
              ["Fewer interviews wasted", "clear fit/no-fit flagged early with mitigation ideas"],
              ["Higher close rates", "trust compounds when brief matches reality"],
            ].map(([t, d], i) => (
              <motion.div key={t} className="card" {...maybe(fadeUp(i))}>
                <div className="text-2xl font-extrabold text-gray-900">{t}</div>
                <p className="mt-2 text-gray-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section-pad">
        <div className="container-tight">
          <h2 className="h2">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <motion.div className="card" {...maybe(fadeUp())}>
              <div className="text-sm text-gray-500 mb-2">For boutique/executive shops</div>
              <div className="text-4xl font-extrabold text-gray-900">
                $3,000<span className="text-lg font-semibold text-gray-500">/mo</span>
              </div>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>• Unlimited briefs</li>
                <li>• Trust-first templates & report blocks</li>
                <li>• Priority support</li>
              </ul>
              <a href="#cta" className="btn btn-primary mt-6 w-full text-center">Request Access</a>
            </motion.div>

            <motion.div className="card" {...maybe(fadeUp(0.15))}>
              <div className="text-sm text-gray-500 mb-2">Enterprise / PE</div>
              <div className="text-4xl font-extrabold text-gray-900">Custom</div>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>• SSO, audit trail, redaction controls</li>
                <li>• Custom outcomes/metrics blocks</li>
                <li>• White-glove onboarding</li>
              </ul>
              <a href="mailto:mason@weldrecruiting.co" className="btn btn-ghost mt-6 w-full text-center">Talk to Sales</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section id="cta" className="section-pad bg-white" {...maybe(fadeUp())}>
        <div className="container-tight card text-center">
          <h2 className="h2">Ready to submit briefs hiring managers trust?</h2>
          <p className="lead mt-2">Request access. We’ll set you up to win the decision.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:mason@weldrecruiting.co" className="btn btn-primary">Request Access</a>
            <a href="/login" className="btn btn-ghost">Log in</a>
          </div>
        </div>
      </motion.section>
    </>
  );
}



