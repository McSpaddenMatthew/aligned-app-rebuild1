// components/NavBar.tsx
import Link from "next/link";

export default function NavBar({ className = "" }: { className?: string }) {
  return (
    <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 ${className}`}>
      <div className="container-tight flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand-500" />
          <span className="font-extrabold tracking-tight">Aligned</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/#why" className="hover:text-gray-900">Why</Link>
          <Link href="/#how" className="hover:text-gray-900">How it Works</Link>
          <Link href="/#proof" className="hover:text-gray-900">Proof</Link>
          <Link href="/#pricing" className="hover:text-gray-900">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">Log in</Link>
          <Link href="/request-access" className="btn btn-primary">Request Access</Link>
        </div>
      </div>
    </header>
  );
}

