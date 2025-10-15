// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="p-8">
      {/* 🔧 Update words/UI anytime without touching auth */}
      <section className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold">Hiring decisions need evidence. Recruiters need trust.</h1>
        <p className="text-slate-600">
          Aligned turns messy inputs into decision-ready reports your hiring managers actually trust.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login?next=/dashboard"
            className="rounded-xl border px-4 py-2 font-medium hover:bg-black hover:text-white transition"
          >
            Log in to continue
          </Link>
          <Link href="/login" className="rounded-xl border px-4 py-2">
            Try a demo
          </Link>
        </div>
      </section>
    </main>
  );
}
