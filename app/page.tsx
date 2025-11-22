import Link from "next/link";

const featureList = [
  {
    title: "Precision Screening",
    text: "Ferrari-fast filtering with AI summaries tuned for hiring managers.",
  },
  {
    title: "Magic-Link Access",
    text: "No passwords. One tap from inbox to dashboard with Supabase auth.",
  },
  {
    title: "Executive-Ready Output",
    text: "Structured, shareable briefs that look as polished as they read.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Aligned • Recruiting Intelligence</p>
          <h1>
            Build an elite hiring cockpit
            <span className="accent"> inspired by Ferrari.</span>
          </h1>
          <p className="lede">
            An MVP that feels premium: passwordless login, fast AI summaries,
            and a clean dashboard built for founders and recruiters.
          </p>
          <div className="hero__cta">
            <Link className="button button--primary" href="/login">
              Launch the app
            </Link>
            <Link className="button button--ghost" href="/dashboard">
              Peek at dashboard
            </Link>
          </div>
          <div className="hero__status">
            <span className="pill pill--glow" />
            <p>Vercel-ready, no duplicate page routers.</p>
          </div>
        </div>
        <div className="hero__panel">
          <div className="panel__chrome">
            <span className="dot dot--red" />
            <span className="dot dot--amber" />
            <span className="dot dot--green" />
          </div>
          <div className="panel__body">
            <p className="panel__label">Live Preview · Dashboard</p>
            <div className="panel__grid">
              {featureList.map((feature) => (
                <div key={feature.title} className="panel__card">
                  <p className="card__title">{feature.title}</p>
                  <p className="card__text">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
