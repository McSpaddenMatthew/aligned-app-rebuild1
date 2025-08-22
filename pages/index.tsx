import type { GetServerSideProps } from "next";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-semibold">Aligned</h1>
        <p className="mt-3 text-slate-700">Hiring decisions need evidence. Recruiters need trust.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/login" className="inline-flex items-center justify-center rounded-md bg-[#0A0A0A] px-5 py-3 text-white">
            Log in
          </Link>
        </div>
        <p className="mt-10 text-sm text-slate-500">© {String(new Date().getFullYear())} Aligned</p>
      </div>
    </main>
  );
}
