// pages/index.tsx
import type { GetServerSideProps } from "next";
import Link from "next/link";

// Force SSR so Next.js does NOT try to prerender "/" at build time.
// This sidesteps the React #130 error during Vercel builds.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-semibold">Aligned</h1>
        <p className="mt-3 text-slate-700">
          Hiring decisions need evidence. Recruiters need trust.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-[#0A0A0A] px-5 py-3 text-white hover:opacity-90"
          >
            Build My First Summary
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 hover:bg-slate-50"
          >
            Go to Dashboard
          </Link>
        </div>
        <p className="mt-10 text-sm text-slate-500">© {String(new Date().getFullYear())} Aligned</p>
      </div>
    </main>
  );
}

