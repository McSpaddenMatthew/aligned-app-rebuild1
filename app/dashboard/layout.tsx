// app/dashboard/layout.tsx
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 p-4 border-r">
        <nav className="space-y-3">
          <Link href="/dashboard" className="block">Overview</Link>
          <Link href="/summaries" className="block">Candidate Summaries</Link>
          <Link href="/summaries/new" className="block">New Summary</Link>
          <Link href="/dashboard/settings" className="block">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
