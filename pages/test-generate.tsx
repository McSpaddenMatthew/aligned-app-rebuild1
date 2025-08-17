import { useState } from "react";

export default function TestGenerate() {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");

  async function run() {
    setLoading(true);
    setOut("");
    const res = await fetch("/api/generate-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateName: "Ava Patel",
        candidateTitle: "Senior Data Engineer",
        location: "Austin, TX",
        industryFit: "Value-based care analytics",
        jobDescription:
          "Lead data engineering for payer analytics; build ELT in DBT/Snowflake; mentor team; partner with finance.",
        recruiterNotes:
          "Strong with CFO comms; mentors juniors; thrives in ambiguity.",
        hmTranscript:
          "[00:14] Need reliable ELT to finance. [06:02] Decisions, not dashboards.",
        candidateResume: "Snowflake, DBT, Airflow; reduced costs 22%.",
        candidateCall:
          "[03:10] I frame tradeoffs in cash impact and SLA risk.",
      }),
    });
    const json = await res.json();
    setLoading(false);
    setOut(json.generated || JSON.stringify(json, null, 2));
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "-apple-system, system-ui, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 12 }}>Aligned — Trust Report (Test)</h1>
      <button
        onClick={run}
        disabled={loading}
        style={{ padding: "10px 14px", borderRadius: 8 }}
      >
        {loading ? "Generating..." : "Generate Example"}
      </button>
      <pre
        style={{
          marginTop: 24,
          whiteSpace: "pre-wrap",
          background: "#0b1020",
          color: "#e7f1ff",
          padding: 16,
          borderRadius: 8,
        }}
      >
        {out}
      </pre>
    </div>
  );
}
