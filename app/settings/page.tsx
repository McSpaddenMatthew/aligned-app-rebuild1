export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Settings will live here. For now, focus on getting into your
            dashboard and creating summaries.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            This page is intentionally simple so the app can build cleanly. Once
            the core Aligned flow is working in production, we&apos;ll add
            profile controls and report preferences here.
          </p>
        </section>
      </div>
    </main>
  );
}
