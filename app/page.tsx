import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Every portfolio hire is a <span className="text-slate-700">value-creation</span> decision.
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
          Aligned uses AI to transform raw hiring data into decision-ready candidate reports.
          Faster decisions. Fewer mis-hires. Trust that scales across your portfolio.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login">
            <Button>Build My First Summary</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">See a Sample Report</Button>
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-sm text-slate-400">
        © {new Date().getFullYear()} Aligned. All rights reserved.
      </footer>
    </main>
  );
}
