import Link from 'next/link';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border border-slate-200 bg-[var(--slate-50)]">
      {children}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-20"
           style={{ background: 'radial-gradient(800px 400px at 50% 0%, #FF6B35 0%, transparent 60%)' }} />
      <div className="section py-16 md:py-24 text-center">
        <div className="flex flex-col items-center gap-6">
          <Badge>Built for recruiters. Trusted by hiring managers.</Badge>
          <h1 className="h1 max-w-3xl">
            Hiring decisions need evidence. Recruiters need trust. Meet the bridge.
          </h1>
          <p className="sub max-w-2xl">
            Aligned turns messy inputs into decision-ready reports that hiring managers trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/dashboard/new" className="btn btn-primary">Build My First Summary</Link>
            <a href="#how" className="btn">See how it works</a>
          </div>

          <div className="w-full mt-10 card p-6">
            <div className="aspect-[16/9] w-full rounded-xl bg-[var(--slate-100)] grid place-items-center text-[var(--slate)]">
              Preview: Decision-ready report (coming soon)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


