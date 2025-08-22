// pages/new-summary.tsx
import type { GetServerSideProps } from "next";
import Link from "next/link";

// SSR guard so Next doesn't pre-render this page during build
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default function NewSummary() {
  return (
    <main className="min-h-screen p-8 bg-white text-[#0A0A0A]">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">New Summary</h1>
        <p className="mt-2 text-slate-700">
          Minimal placeholder to keep deploys green. Wire this to your generator next.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Hiring Manager Notes</span>
            <textarea className="mt-1 w-full rounded border p-2" rows={4} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Candidate Notes</span>
            <textarea className="mt-1 w-full rounded border p-2" rows={4} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Resume (paste)</span>
            <textarea className="mt-1 w-full rounded border p-2" rows={6} />
          </label>

          <button type="button" className="rounded bg-black px-4 py-2 text-white">
            Generate Report
          </button>
        </div>

        <Link href="/dashboard" className="mt-6 inline-block text-sm underline">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

