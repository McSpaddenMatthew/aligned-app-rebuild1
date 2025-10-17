'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      {/* NAV (minimal, confident) */}
      <header className="border-b border-[#F1F5F9]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-extrabold tracking-tight">Aligned</div>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-[#475569] hover:text-[#0A0A0A] transition"
            >
              Product
            </Link>
            <Link
              href="/login"
              className="text-sm text-[#475569] hover:text-[#0A0A0A] transition"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold bg-[#FF6B35] text-white hover:opacity-90 transition"
            >
              Get My First 3 Reports Free
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Hiring decisions need evidence.
          <br className="hidden md:block" />
          <span className="text-[#0A0A0A]"> PE firms need confidence.</span>
        </motion.h1>

        <motion.p
          className="mt-5 text-lg text-[#475569] max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          Built by recruiters who believe in evidence over opinion. Aligned turns recruiter insight
          into investor-grade clarity so operating partners can decide faster—with less risk.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Link
            href="/login"
            className="rounded-lg px-5 py-3 font-semibold bg-[#FF6B35] text-white text-sm md:text-base hover:opacity-90 transition text-center"
          >
            Get My First 3 Reports Free
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-5 py-3 font-semibold border border-[#E2E8F0] text-[#0A0A0A] text-sm md:text-base hover:bg-[#F1F5F9] transition text-center"
          >
            See a Sample Investor Report
          </Link>
        </motion.div>
      </section>

      {/* PLAN — Three steps from noise to clarity */}
      <section className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold">Three steps from noise to clarity</h2>
          <p className="mt-2 text-[#475569] max-w-2xl">
            A simple path PE teams can trust—no retooling your process required.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              number="1"
              title="Start with Evidence"
              body="Capture what the operator actually says matters—the lens every candidate is judged against."
            />
            <Step
              number="2"
              title="Translate to Insight"
              body="Aligned scores and summarizes each candidate against those priorities, revealing fit and risk."
            />
            <Step
              number="3"
              title="Decide with Confidence"
              body="Deliver investor-grade reports that align recruiters, hiring managers, and partners fast."
            />
          </div>
        </div>
      </section>

      {/* GUIDE / AUTHORITY */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Built by recruiters. Trusted by operators.</h3>
            <p className="mt-3 text-[#475569]">
              We believe in recruiters—and we know operating partners think in outcomes. Aligned is
              the trust layer between both: turning calls, notes, and resumes into decision-ready
              evidence used by boards and investors.
            </p>

            <ul className="mt-6 space-y-3 text-[#0A0A0A]">
              <li className="flex gap-3">
                <Bullet /> Investor-style summary with risks & mitigations
              </li>
              <li className="flex gap-3">
                <Bullet /> JD trust table with timestamped quotes
              </li>
              <li className="flex gap-3">
                <Bullet /> Requirement scorecard & next-step recommendation
              </li>
            </ul>
          </div>

          {/* Lightweight mock card to imply ‘elite’ without clutter */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Investor Report Preview</div>
              <div className="h-2 w-20 rounded bg-[#F1F5F9]" />
            </div>
            <div className="mt-4 h-2 w-48 rounded bg-[#F1F5F9]" />
            <div className="mt-2 h-2 w-40 rounded bg-[#F1F5F9]" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="rounded-xl border border-[#E2E8F0] p-4">
                  <div className="h-2 w-20 rounded bg-[#F1F5F9]" />
                  <div className="mt-2 h-2 w-24 rounded bg-[#F1F5F9]" />
                  <div className="mt-4 h-8 rounded bg-[#F8FAFC]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS vs FAILURE */}
      <section className="bg-[#0A0A0A] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h3 className="text-2xl md:text-3xl font-bold">The cost of mis-hires? Millions.</h3>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 p-6">
              <h4 className="font-semibold">Without Aligned</h4>
              <ul className="mt-4 space-y-2 text-white/80">
                <li>Opinions over evidence</li>
                <li>Slow decisions and stalled searches</li>
                <li>Trust gap between recruiters and operators</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 p-6">
              <h4 className="font-semibold">With Aligned</h4>
              <ul className="mt-4 space-y-2 text-white/80">
                <li>Investor-grade clarity</li>
                <li>Confident, faster calls</li>
                <li>Recruiters earn durable trust</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-6xl px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-2xl font-bold">Confidence in every hire.</div>
            <div className="text-[#475569]">Turn your next search into evidence.</div>
          </div>
          <Link
            href="/login"
            className="rounded-full px-5 py-3 font-semibold bg-[#FF6B35] text-white hover:opacity-90 transition"
          >
            Build My First Summary
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
      <div className="h-9 w-9 rounded-full bg-[#F1F5F9] flex items-center justify-center font-semibold">
        {number}
      </div>
      <h4 className="mt-4 text-lg font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-[#475569] leading-relaxed">{body}</p>
    </div>
  );
}

function Bullet() {
  return <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[#FF6B35] flex-shrink-0" />;
}


