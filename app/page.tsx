import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-white text-[#0A0A0A]">
      {/* Header */}
      <header className="px-6 md:px-8 pt-6 pb-3 border-b">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">Aligned</div>
          <nav className="flex items-center gap-3">
            <a
              href="/summaries"
              className="text-sm underline underline-offset-4"
            >
              Dashboard
            </a>
            {/* Use a plain anchor so it always goes to /login (no hashes) */}
            <a
              href="/login"
              className="text-sm border rounded-xl px-3 py-1.5 hover:bg-gray-50"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* Trust Ribbon */}
      <div className="bg-[#F1F5F9] text-center text-sm py-2">
        AI-powered, evidence-first • White-glove first 3 reports • Built for PE portfolio hiring
      </div>

      {/* Hero */}
      <section className="px-6 md:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Every portfolio hire is a <span className="text-[#0A1F44]">value-creation decision</span>.
          </h1>
          <p className="mt-6 text-lg text-[#475569]">
            Aligned uses AI to transform raw hiring data into decision-ready candidate reports.
            Faster decisions. Fewer mis-hires. Trust that scales across your portfolio.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-[#0A1F44] text-white rounded-lg font-semibold hover:bg-[#07152f] transition"
            >
              Build My First Summary
            </Link>
            <Link
              href="#sample-report"
              className="px-6 py-3 border border-[#0A0A0A] text-[#0A0A0A] rounded-lg font-medium hover:bg-[#F1F5F9] transition"
            >
              See a Sample Report
            </Link>
          </div>
        </div>
      </section>

      {/* Three-Step Explainer */}
      <section className="px-6 md:px-8 py-16 bg-[#F1F5F9]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 md:gap-8 text-center">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center border border-[#0A1F44] text-[#0A1F44] rounded-full font-bold">
              1
            </div>
            <h3 className="font-semibold text-lg">Enter the Raw Data</h3>
            <p className="text-sm text-[#475569] mt-2">
              Intake notes, JDs, recruiter notes. Drop it all in.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center border border-[#0A1F44] text-[#0A1F44] rounded-full font-bold">
              2
            </div>
            <h3 className="font-semibold text-lg">AI Turns Words Into Data</h3>
            <p className="text-sm text-[#475569] mt-2">
              We map candidates to value-creation goals and surface risks.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center border border-[#0A1F44] text-[#0A1F44] rounded-full font-bold">
              3
            </div>
            <h3 className="font-semibold text-lg">Decide With Confidence</h3>
            <p className="text-sm text-[#475569] mt-2">
              Deliver decision-ready reports trusted by CEOs and boards.
            </p>
          </div>
        </div>
      </section>

      {/* With vs Without */}
      <section className="px-6 md:px-8 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold text-lg mb-4">Without Aligned</h3>
            <ul className="space-y-2 text-[#475569] text-sm">
              <li>• Weeks lost in interview loops</li>
              <li>• $100K+ search fees per hire</li>
              <li>• Mis-hires that slow enterprise value creation</li>
            </ul>
          </div>
          <div className="p-6 border rounded-xl bg-[#F1F5F9]">
            <h3 className="font-semibold text-lg mb-4">With Aligned</h3>
            <ul className="space-y-2 text-sm">
              <li>• Faster, evidence-backed decisions</li>
              <li>• Executives aligned to value-creation goals</li>
              <li>• Trust from CEOs, boards, and LPs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-8 py-20 text-center bg-[#0A0A0A] text-white">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Stop guessing. Start showing evidence.
        </h2>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-[#0A1F44] text-white rounded-lg font-semibold hover:bg-[#07152f] transition"
          >
            Build My First Summary
          </Link>
          <Link
            href="#sample-report"
            className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition"
          >
            See a Sample Report
          </Link>
        </div>
      </section>
    </main>
  );
}


