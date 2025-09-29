// app/page.tsx – Full homepage with all CTAs pointing to /login

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#FF6B35]" aria-hidden />
            <span className="text-lg font-semibold tracking-tight">Aligned</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#problem" className="hover:text-[#0A0A0A]">The Problem</a>
            <a href="#plan" className="hover:text-[#0A0A0A]">How It Works</a>
            <a href="#proof" className="hover:text-[#0A0A0A]">Proof</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-slate-600 hover:text-[#0A0A0A]">Access Aligned</a>
            <a href="/login" className="inline-flex items-center rounded-xl bg-[#FF6B35] px-4 py-2 text-white text-sm font-medium hover:opacity-90">
              Reduce Hiring Risk Now
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="mb-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Evidence-based. PE-backed. Risk-reducing.
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Data-backed hiring decisions. Lower mis-hire risk.
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl">
              Portfolio companies succeed when they hire leaders who deliver value from day one.
              Aligned turns intake notes into <span className="font-medium text-[#0A0A0A]">quantified scorecards and evidence-backed memos</span>
              &mdash; so operating partners gain confidence, reduce risk, and accelerate growth.
            </p>
            <p className="mt-4 text-base text-slate-500 italic">
              Because hiring decisions should be based on evidence, not opinion.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/login" className="inline-flex items-center rounded-xl bg-[#FF6B35] px-5 py-3 text-white font-medium hover:opacity-90">
                Reduce Hiring Risk Now
              </a>
              <a href="#plan" className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-[#0A0A0A] font-medium hover:bg-slate-50">
                See How It Works
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Trusted in executive searches across healthcare and finance portfolios.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-sm text-slate-500">Preview</div>
              <div className="mt-3 rounded-xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Quantified & Transparent Memo</div>
                <div className="mt-2 text-sm font-medium">Priority → Evidence (auto-extracted)</div>
                <ul className="mt-2 text-sm text-slate-600 space-y-2">
                  <li>• Priority: 90-day BI rebuild → Outcome: 60-day dashboard delivery</li>
                  <li>• Priority: Modern stack → Tools: Airflow, dbt, Snowflake, Looker (&mdash;28% cost)</li>
                  <li>• Priority: Exec presence → Method: Decision → Evidence → Trade-off framing</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs">Quantified fit scorecard</span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-xs">Transparent risks & mitigations</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Copy Link</button>
                <button className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">Export PDF</button>
              </div>
            </div>
            <div className="mt-8">
              <a href="/login" className="inline-flex items-center rounded-xl bg-[#FF6B35] px-6 py-3 text-white font-medium hover:opacity-90">
                Reduce Hiring Risk Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER VISUAL */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                From process-heavy hiring to evidence-backed clarity.
              </h2>
              <p className="mt-4 text-slate-600">
                Traditional recruiting relies on calls, notes, and long interview loops.
                It's not wrong &mdash; it's just not built for PE firms who care about ROI and speed.
                Aligned reframes candidate data into quantified outcomes and transparent risks,
                so operating partners can make defensible decisions faster &mdash; often with fewer interviews.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 p-5 bg-white">
                  <h3 className="text-sm font-medium text-slate-500">Traditional Notes</h3>
                  <ul className="mt-3 text-sm text-slate-600 space-y-2">
                    <li>• "Strong technical skills, leadership less clear."</li>
                    <li>• "Excels in data, team maturity TBD."</li>
                    <li>• "Worked at X, might be a good fit."</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5 bg-white">
                  <h3 className="text-sm font-medium text-slate-500">Aligned Memo</h3>
                  <ul className="mt-3 text-sm text-slate-600 space-y-2">
                    <li>• Priority: 90-day BI rebuild → Outcome: 60-day dashboard delivery</li>
                    <li>• Priority: Modern stack → Tools: dbt, Snowflake, Looker (&mdash;28% cost)</li>
                    <li>• Priority: Exec presence → Method: Decision → Evidence → Trade-offs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section id="problem" className="border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-6">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">The cost of mis-hires.</h2>
            <p className="mt-4 text-slate-600">
              External: Mis-hires drain millions in salary, ramp, and lost opportunity.
              Internal: Recruiters speak a different language and bring bias into the process.
              Philosophical: Hiring decisions should be based on evidence, not opinion.
            </p>
          </div>
          <div className="md:col-span-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Value erosion", body: "Every bad hire drags portfolio performance down." },
                { title: "Time wasted", body: "Rework cycles delay impact at portfolio companies." },
                { title: "Bias & spin", body: "Recruiters push resumes; leaders need proof of value." },
              ].map((f, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 p-5">
                  <div className="h-8 w-8 rounded-md bg-[#FF6B35]" aria-hidden />
                  <div className="font-medium">{f.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE PLAN */}
      <section id="plan" className="border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">The plan to reduce risk</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Drop in notes", body: "Add hiring manager notes or transcripts." },
              { step: "2", title: "AI structures evidence", body: "We extract priorities, map candidate proof, and quantify fit." },
              { step: "3", title: "Deliver evidence-backed memo", body: "One-click link or PDF. Transparent risks and clear next step." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-slate-200 p-6">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-sm font-medium">{s.step}</div>
                <div className="mt-4 font-medium">{s.title}</div>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href="/login" className="inline-flex items-center rounded-xl bg-[#FF6B35] px-5 py-3 text-white font-medium hover:opacity-90">
              Reduce Hiring Risk Now
            </a>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Proof & Credibility</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              "Cycle compression (3x faster decisions)",
              "Risk mitigation (&mdash;40% rework)",
              "Board-level decision confidence ($1M+ mis-hire risk avoided)",
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-5">
                <div className="h-8 w-8 rounded-md bg-[#FF6B35] mb-3" aria-hidden />
                <div className="text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: t }} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Logos represent companies served by Weld Recruiting using Aligned as part of our process.
          </p>
        </div>
      </section>

      {/* CTA STRIP */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="rounded-2xl border border-slate-200 p-8 md:p-10 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Defend every hire with data.</h3>
              <p className="mt-2 text-slate-600">
                Aligned turns intake notes into evidence-based, evidence-backed memos &mdash; so you can reduce risk and protect portfolio value.
              </p>
            </div>
            <a href="/login" className="inline-flex items-center rounded-xl bg-[#FF6B35] px-5 py-3 text-white font-medium hover:opacity-90">
              Reduce Hiring Risk Now
            </a>
          </div>
        </div>
      </section>

      {/* SUCCESS VISION */}
      <section className="bg-slate-50 border-t border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Imagine your portfolio companies hiring with confidence.</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            With Aligned, every leadership hire is backed by quantified evidence, transparent risks, and evidence-backed memos.
            Operating partners gain defensibility. Recruiters gain credibility. Portfolio companies gain leaders who deliver value from day one.
          </p>
          <p className="mt-4 text-base text-slate-500 italic">Because hiring decisions should be based on evidence, not opinion.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-[#FF6B35]" aria-hidden />
            <span>© {new Date().getFullYear()} Aligned</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#0A0A0A]">Privacy</a>
            <a href="#" className="hover:text-[#0A0A0A]">Terms</a>
            <a href="mailto:hello@wearealigned.com" className="hover:text-[#0A0A0A]">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}



