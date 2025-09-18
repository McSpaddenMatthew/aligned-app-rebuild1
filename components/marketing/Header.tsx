export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="section h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-xl" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9A35)' }} />
          <span className="font-semibold tracking-tight">Aligned</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-[var(--slate)]">
          <a href="#how" className="hover:underline">How it works</a>
          <a href="/login" className="btn px-4 py-2">Login</a>
        </nav>
      </div>
    </header>
  );
}

