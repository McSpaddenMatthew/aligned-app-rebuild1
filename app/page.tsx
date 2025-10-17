export default function Home() {
  return (
    <section className="grid gap-6 md:grid-cols-2 items-center">
      <div className="space-y-5">
        <h1 className="text-4xl font-bold leading-tight">
          Hiring decisions need evidence. Recruiters need trust.
        </h1>
        <p className="text-slate-600">
          Aligned turns messy inputs into decision-ready reports your hiring
          managers actually trust.
        </p>
        <div className="flex gap-3">
          <a href="/login" className="inline-flex items-center rounded-2xl border px-4 py-2">
            Log in
          </a>
          <a href="/dashboard" className="inline-flex items-center rounded-2xl border px-4 py-2">
            Go to dashboard
          </a>
        </div>
        <ul className="text-sm text-slate-500 list-disc pl-5">
          <li>Start with evidence (HM words first).</li>
          <li>Frame candidates against those priorities.</li>
          <li>Deliver a clean, decision-ready report.</li>
        </ul>
      </div>

      <div className="hidden md:block">
        <div className="rounded-2xl border p-6 shadow-sm">
          <div className="h-40 rounded-lg border grid place-items-center text-sm text-slate-500">
            Preview card area
          </div>
          <p className="mt-3 text-sm text-slate-500">
            This is a visual placeholder. Purely cosmetic; remove anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

