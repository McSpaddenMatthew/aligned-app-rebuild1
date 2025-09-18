export default function Footer() {
  return (
    <footer className="section py-10 border-t border-slate-200">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between text-sm text-[var(--slate)]">
        <div>© {new Date().getFullYear()} Aligned</div>
        <div className="flex gap-4">
          <a href="/login" className="underline">Login</a>
          <a href="/dashboard" className="underline">Dashboard</a>
        </div>
      </div>
    </footer>
  );
}
