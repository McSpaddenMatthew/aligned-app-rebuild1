// app/layout.tsx
import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">Aligned</Link>
            <nav className="flex items-center gap-3">
              <Link href="/login?next=/dashboard" className="rounded-xl border px-3 py-1.5">
                Login
              </Link>
              <Link href="/dashboard" className="rounded-xl border px-3 py-1.5">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4">{children}</div>
      </body>
    </html>
  );
}


