// pages/test-generate.tsx
import type { GetServerSideProps } from "next";
import Link from "next/link";

// Prevent static pre-render during Vercel build
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });

export default function TestGenerate() {
  return (
    <main className="min-h-screen p-8 bg-white text-[#0A0A0A]">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Test Generate</h1>
        <p className="mt-2 text-slate-700">Minimal placeholder to keep builds green.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="text-sm font-medium">Notes</span>
            <textarea className="mt-1 w-full rounded border p-2" rows={4} />
          </label>
          <button className="rounded bg-black px-4 py-2 text-white" type="submit">
            Generate
          </button>
        </form>

        <Link href="/dashboard" className="mt-6 inline-block text-sm underline">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

