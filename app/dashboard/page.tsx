const highlights = [
  { label: "Active Searches", value: "12", detail: "High-touch roles in flight" },
  { label: "Candidates in Play", value: "48", detail: "Screened & engaged" },
  { label: "Hiring Velocity", value: "17d", detail: "Median days to offer" },
];

const pipeline = [
  {
    name: "Chief of Staff",
    status: "Finalizing panel",
    confidence: "82%",
    notes: "Two finalists with exec sponsor buy-in.",
  },
  {
    name: "Director, AI Ops",
    status: "Shortlist ready",
    confidence: "68%",
    notes: "Modeling a GTM + infra hybrid profile.",
  },
  {
    name: "Sr. Product Designer",
    status: "Sourcing",
    confidence: "55%",
    notes: "Portfolio-first review cadence set for Tue/Thu.",
  },
];

export default function DashboardPage() {
  return (
    <main className="page-shell dashboard">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">Aligned Dashboard</p>
          <h1>
            Command center
            <span className="accent"> for hiring sprints.</span>
          </h1>
          <p className="lede">
            Crisp, Ferrari-inspired panels so leaders can skim signal faster than
            the next standup.
          </p>
        </div>
        <div className="badge">Live</div>
      </header>

      <section className="dashboard__grid">
        {highlights.map((item) => (
          <div key={item.label} className="tile tile--metric">
            <p className="tile__label">{item.label}</p>
            <p className="tile__value">{item.value}</p>
            <p className="tile__detail">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="dashboard__panel">
        <header className="panel__header">
          <div>
            <p className="eyebrow">Pipeline radar</p>
            <h2>Priority roles</h2>
          </div>
          <button className="button button--ghost" type="button">
            Export summary
          </button>
        </header>
        <div className="pipeline">
          {pipeline.map((row) => (
            <article key={row.name} className="pipeline__row">
              <div>
                <p className="pipeline__title">{row.name}</p>
                <p className="pipeline__detail">{row.notes}</p>
              </div>
              <div className="pill pill--status">{row.status}</div>
              <div className="pipeline__confidence">{row.confidence}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
