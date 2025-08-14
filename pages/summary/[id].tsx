import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function SummaryPage() {
  const { query } = useRouter();
  const id = (query.id as string) || "";
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("summaries")
        .select("summary")
        .eq("id", id)
        .single();
      if (error) setErr(error.message);
      else setText(data?.summary ?? "");
      setLoading(false);
    })();
  }, [id]);

  if (!id) return <PageWrap><p>Loading…</p></PageWrap>;
  if (loading) return <PageWrap><p>Loading summary…</p></PageWrap>;
  if (err) return <PageWrap><p style={{color:"#b91c1c"}}>Error: {err}</p></PageWrap>;
  if (!text) return <PageWrap><p>No summary found.</p></PageWrap>;

  return (
    <PageWrap>
      <h1 style={{ fontWeight: 700, fontSize: 24, marginBottom: 12 }}>Candidate Summary</h1>
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{text}</pre>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={() => navigator.clipboard.writeText(text)} style={btnGhost}>Copy</button>
        <button onClick={() => window.print()} style={btnPrimary}>Print / Save as PDF</button>
      </div>
    </PageWrap>
  );
}

const PageWrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
    {children}
  </div>
);

const btnPrimary: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #bfdbfe",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
};


