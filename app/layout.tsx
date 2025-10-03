import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Aligned",
  description: "Hiring decisions need evidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white text-slate-900">
      <body className={inter.className}>
        <header className="border-b">
          <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Aligned
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/summaries" className="text-sm hover:opacity-70">
                Dashboard
              </Link>
              <Link
                href="/login"
                className="text-sm border rounded-xl px-3 py-1.5 hover:bg-slate-50"
              >
                Login
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

        <footer className="mt-20 border-t">
          <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-slate-500">
            © {new Date().getFullYear()} Aligned — Built for recruiters. Trusted by hiring managers.
          </div>
        </footer>
      </body>
    </html>
  );
}
