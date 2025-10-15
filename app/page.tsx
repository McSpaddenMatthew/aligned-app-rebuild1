// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="w-full border-b">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-black" />
            <span className="font-semibold">Aligned</span>
          </div>
          <a
            href="/login?next=/dashboard"
            className="rounded-xl px-4 py-2 text-sm font-medium border hover:bg-gray-50"
          >
            Login
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Hiring decisions need evidence. <br className="hidden md:block" />
            Recruiters need trust. <span className="text-[#FF6B35]">Meet the bridge.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Aligned turns messy inputs into decision-ready reports that hiring managers trust.
          </p>
          <div className="mt-8">
            <a
              href="/login?next=/dashboard"
              className="inline-block rounded-2xl px-6 py-3 bg-black text-white font-medium hover:opacity-90"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

