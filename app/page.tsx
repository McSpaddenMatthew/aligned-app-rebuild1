import Link from "next/link";

const stakes = [
  {
    title: "Protect the fund thesis",
    detail: "Back every operator hire with audit-ready evidence so the IC never questions the decision.",
  },
  {
    title: "Compress diligence time",
    detail: "Cut through recruiter spin and get a clean signal on whether the candidate can move the needle in 48 hours.",
  },
  {
    title: "Avoid seven-figure mistakes",
    detail: "One wrong executive hire can vaporize a fund's carry. We make the downside painfully clear before you sign.",
  },
];

const proofPoints = [
  {
    label: "Minutes to clarity",
    value: "07",
    copy: "Upload transcripts, resumes, and deal notes. Aligned returns a McKinsey-grade brief before your next partner meeting.",
  },
  {
    label: "Operators vetted",
    value: "1,200+",
    copy: "Every report is shaped by playbooks from top-quartile PE operating partners and GTM advisors.",
  },
  {
    label: "Value at stake",
    value: "$48M",
    copy: "Average EBITDA guarded per mandate using Aligned decision memos across growth + buyout funds.",
  },
];

const steps = [
  {
    title: "Ingest the truth",
    detail: "Drop the candidate call transcript, resume, HM conversation notes, JD, and market intel. No formatting required.",
  },
  {
    title: "Aligned rewrites the signal",
    detail: "GPT‑5.1 is steered by our operator framework to surface value creation levers, risks, and diligence-ready claims.",
  },
  {
    title: "Brief the operating partner",
    detail: "Send a hiring-manager-ready summary plus focus questions so every interview minute pushes toward the deal thesis.",
  },
];

const principles = [
  "StoryBrand clarity: the operating partner is the hero, we are the guide.",
  "McKinsey-level polish with Alex Hormozi's obsession over value.",
  "Designed for seven-figure decisions, not junior analyst staffing.",
];

export default function Home() {
  return (
    <main style={{ padding: "48px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 64 }}>
        <section className="card" style={{ padding: 48, background: "linear-gradient(135deg, rgba(5,7,15,0.95), rgba(8,10,25,0.92))" }}>
          <div className="tag">Trusted guide for PE operating partners</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", marginTop: 32 }}>
            <div style={{ flex: "1 1 360px" }}>
              <h1 style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", lineHeight: 1.05, margin: 0 }}>
                Protect every critical hire with a trust layer between recruiters and operating partners.
              </h1>
              <p style={{ marginTop: 24, color: "var(--text-dim)", fontSize: "1.1rem" }}>
                Private equity partners are the hero. Aligned is the Yoda that distills transcripts, resumes, and job intel into a decisive brief so you never gamble millions on a gut feel.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 32 }}>
                <Link
                  href="/login"
                  style={{
                    background: "var(--accent-strong)",
                    color: "#041013",
                    borderRadius: 999,
                    padding: "14px 28px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.08,
                  }}
                >
                  Enter via Magic Link
                </Link>
                <a
                  href="#stakes"
                  style={{
                    borderRadius: 999,
                    padding: "14px 24px",
                    border: "1px solid var(--border)",
                    textTransform: "uppercase",
                    letterSpacing: 0.08,
                  }}
                >
                  See why PE teams use Aligned
                </a>
              </div>
            </div>
            <div className="gradient-border" style={{ flex: "1 1 320px", maxWidth: 480 }}>
              <div
                className="card"
                style={{
                  background: "rgba(4,6,12,0.92)",
                  borderRadius: 30,
                  minHeight: 320,
                }}
              >
                <p className="text-dim" style={{ textTransform: "uppercase", letterSpacing: 0.08 }}>Workflow snapshot</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "24px 0", display: "grid", gap: 18 }}>
                  <li>
                    <strong>1. Capture reality</strong>
                    <p className="text-dim">Resume · candidate call · HM notes · JD · extra intel</p>
                  </li>
                  <li>
                    <strong>2. Align incentives</strong>
                    <p className="text-dim">Aligned removes recruiter gloss + surfaces risks</p>
                  </li>
                  <li>
                    <strong>3. Brief the operator</strong>
                    <p className="text-dim">Send a memo tailored to the value creation plan</p>
                  </li>
                </ul>
                <p style={{ color: "var(--accent)", fontWeight: 600 }}>Built for board-level hiring decisions.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="stakes" style={{ display: "grid", gap: 24 }}>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>The stakes for every operator hire</h2>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {stakes.map((item) => (
              <div key={item.title} className="card">
                <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                <p className="text-dim">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>Proof that Aligned operates at the partner level</h2>
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Launch your workspace →</Link>
          </div>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {proofPoints.map((point) => (
              <div key={point.label} className="card" style={{ borderColor: "rgba(167,243,208,0.3)" }}>
                <p className="text-dim" style={{ textTransform: "uppercase", letterSpacing: 0.08 }}>{point.label}</p>
                <p style={{ fontSize: "3rem", margin: "8px 0 16px" }}>{point.value}</p>
                <p className="text-dim">{point.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ display: "grid", gap: 32 }}>
          <h2 style={{ margin: 0 }}>A StoryBrand inspired buyer's journey</h2>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {steps.map((step, idx) => (
              <div key={step.title}>
                <p className="text-dim" style={{ letterSpacing: 0.1 }}>{String(idx + 1).padStart(2, "0")}</p>
                <h3 style={{ margin: "8px 0" }}>{step.title}</h3>
                <p className="text-dim">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ background: "rgba(10,12,20,0.95)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ margin: 0 }}>Operating principles</h2>
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
              {principles.map((principle) => (
                <li key={principle} className="text-dim">{principle}</li>
              ))}
            </ul>
            <p style={{ marginTop: 16 }}>
              Every screen, word, and workflow is calibrated to reassure a skeptical operating partner that the recruiter is on their side. You're hiring for multi-million-dollar outcomes — Aligned keeps the narrative sharp, premium, and data-backed.
            </p>
          </div>
        </section>

        <section className="card" style={{ textAlign: "center", borderColor: "rgba(250,204,21,0.4)" }}>
          <p className="tag" style={{ justifyContent: "center", marginBottom: 16 }}>Next action</p>
          <h2 style={{ margin: "0 0 16px" }}>Own the trust barrier on your next critical hire</h2>
          <p className="text-dim" style={{ maxWidth: 720, margin: "0 auto 32px" }}>
            Send yourself a Magic Link, load your first candidate call, and ship a memo that feels like it came straight from a McKinsey PE diligence pod.
          </p>
          <Link
            href="/login"
            style={{
              background: "var(--accent-warm)",
              color: "#0b0d1a",
              borderRadius: 999,
              padding: "16px 36px",
              fontWeight: 700,
              letterSpacing: 0.08,
              textTransform: "uppercase",
            }}
          >
            Send me a Magic Link
          </Link>
        </section>
      </div>
    </main>
  );
}
