// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      {/* NAV */}
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-semibold tracking-tight">Aligned</div>
        <nav className="flex items-center gap-4">
          <Link
            href="/summaries/new"
            className="hidden sm:inline-block rounded-xl border border-[#1E3A8A] text-[#1E3A8A] px-4 py-2 text-sm hover:bg-[#F8FAFF]"
          >
            New Summary
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Login
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
          Turn recruiting signals into
          <br className="hidden sm:block" /> decision-ready reports.
        </h1>
        <p className="mt-4 text-lg text-[#475569] max-w-2xl">
          <span className="font-semibold">PE firms are the hero.</span> Aligned is
          the guide—transforming what your recruiters already collect into concise,
          manager-trusted summaries. No new workflows. Just clearer decisions, faster.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            href="/summaries/new"
            className="rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
          >
            Build My First Summary
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#1E3A8A] text-[#1E3A8A] px-5 py-3 text-sm font-medium hover:bg-[#F8FAFF]"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Tiny reassurance line */}
        <p className="mt-3 text-sm text-[#64748B]">
          We don’t replace recruiters—we help you get more from the work they already do.
        </p>
      </section>

      {/* VALUE STRIPS (minimal, “Ferrari” calm) */}
      <section className="mx-auto max-w-6xl px-6 py-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-sm font-semibold mb-1">Faster consensus</div>
          <p className="text-sm text-[#475569]">
            Summaries your operators can skim in under two minutes.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-sm font-semibold mb-1">Higher trust</div>
          <p className="text-sm text-[#475569]">
            Pulls directly from HM notes, resume, candidate call, and JD.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-sm font-semibold mb-1">Zero new tools</div>
          <p className="text-sm text-[#475569]">
            Keep your process. Paste the five sources—get a clean report back.
          </p>
        </div>
      </section>

      {/* SIMPLE PLAN (Donald Miller style) */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-[#E5E7EB] p-6">
          <div className="text-sm font-semibold text-[#1E3A8A] mb-2">
            A clear plan
          </div>
          <ol className="grid gap-4 sm:grid-cols-3 list-decimal list-inside">
            <li className="text-sm">
              <span className="font-medium">Paste your five inputs</span>
              <span className="block text-[#64748B]">
                HM notes, resume, candidate call, JD, optional intel.
              </span>
            </li>
            <li className="text-sm">
              <span className="font-medium">Generate the summary</span>
              <span className="block text-[#64748B]">
                Tight, manager-ready, email-friendly.
              </span>
            </li>
            <li className="text-sm">
              <span className="font-medium">Share & decide</span>
              <span className="block text-[#64748B]">
                Faster alignment. Stronger yes/no calls.
              </span>
            </li>
          </ol>
          <div className="mt-6">
            <Link
              href="/summaries/new"
              className="rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
            >
              Create a Summary
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER (quiet) */}
      <footer className="border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-[#94A3B8] flex items-center justify-between">
          <span>© {new Date().getFullYear()} Aligned</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-[#1E3A8A]">Login</Link>
            <Link href="/summaries/new" className="hover:text-[#1E3A8A]">New Summary</Link>
            <Link href="/dashboard" className="hover:text-[#1E3A8A]">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}


