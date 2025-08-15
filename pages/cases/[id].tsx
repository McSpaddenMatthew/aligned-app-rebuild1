import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

type CaseRow = { id: string; candidate_name: string; role: string | null; created_at: string };
type Artifact = {
  id: string;
  kind: "file" | "note";
  title: string | null;
  content: string | null;
  file_path: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CasePage() {
  const router = useRouter();
  const caseId = useMemo(() => (router.query.id as string) || "", [router.query.id]);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  const [row, setRow] = useState<CaseRow | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Notes model we'll save as individual 'note' artifacts
  const [hm, setHm] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [jd, setJd] = useState("");
  const [ta, setTa] = useState("");
  const [candidate, setCandidate] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      setMe(session.user.id);

      if (!caseId) return;
      const { data: caseData, error: caseErr } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();
      if (caseErr || !caseData) {
        router.replace("/dashboard");
        return;
      }
      setRow(caseData as CaseRow);

      const { data: arts } = await supabase
        .from("artifacts")
        .select("id,kind,title,content,file_path,created_at")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (mounted && arts) {
        setArtifacts(arts as Artifact[]);
        // hydrate note boxes if present
        setHm(arts.find((a) => a.kind === "note" && a.title === "hm_convo")?.content || "");
        setRecruiter(
          arts.find((a) => a.kind === "note" && a.title === "recruiter_notes")?.content || ""
        );
        setJd(arts.find((a) => a.kind === "note" && a.title === "jd")?.content || "");
        setTa(arts.find((a) => a.kind === "note" && a.title === "ta_notes")?.content || "");
        setCandidate(
          arts.find((a) => a.kind === "note" && a.title === "candidate_notes")?.content || ""
        );
      }

      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [caseId, router]);

  async function uploadFiles(files: FileList | null) {
    if (!files || !me || !caseId) return;
    setBusy(true);
    setMsg(null);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${me}/${caseId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("artifacts").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        setMsg(upErr.message);
        setBusy(false);
        return;
      }
      await supabase.from("artifacts").insert([
        { case_id: caseId, user_id: me, kind: "file", title: file.name, file_path: path },
      ]);
    }

    // reload
    const { data: arts } = await supabase
      .from("artifacts")
      .select("id,kind,title,content,file_path,created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    setArtifacts((arts || []) as Artifact[]);
    setBusy(false);
  }

  async function saveNotes() {
    if (!me || !caseId) return;
    setBusy(true);
    setMsg(null);

    const notePairs: [string, string][] = [
      ["hm_convo", hm],
      ["recruiter_notes", recruiter],
      ["jd", jd],
      ["ta_notes", ta],
      ["candidate_notes", candidate],
    ];

    for (const [title, content] of notePairs) {
      // Upsert: delete existing with same title then insert
      await supabase.from("artifacts").delete().eq("case_id", caseId).eq("kind", "note").eq("title", title);
      if (content.trim().length) {
        await supabase
          .from("artifacts")
          .insert([{ case_id: caseId, user_id: me, kind: "note", title, content }]);
      }
    }

    setMsg("Notes saved.");
    setBusy(false);
  }

  function fileUrl(a: Artifact) {
    if (!a.file_path) return "#";
    const { data } = supabase.storage.from("artifacts").getPublicUrl(a.file_path);
    return data.publicUrl;
  }

  if (!ready || !row) return <p style={{ padding: 24 }}>Loading…</p>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <a href="/dashboard" style={{ textDecoration: "underline" }}>← Back to dashboard</a>
      <h1 style={{ marginTop: 12 }}>
        {row.candidate_name} {row.role ? <span style={{ opacity: 0.7 }}>— {row.role}</span> : null}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
        {/* LEFT: upload + files */}
        <section style={{ padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
          <h2>Drop files</h2>
          <p style={{ margin: "8px 0 12px" }}>
            Add JD, resume, transcripts (HM / TA / candidate), or any related docs.
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => uploadFiles(e.target.files)}
            disabled={busy}
          />
          <h3 style={{ marginTop: 16 }}>Files</h3>
          {artifacts.filter(a => a.kind === "file").length === 0 ? (
            <p>No files yet.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {artifacts
                .filter((a) => a.kind === "file")
                .map((a) => (
                  <li key={a.id}>
                    <a href={fileUrl(a)} target="_blank" rel="noreferrer">
                      {a.title || a.file_path}
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* RIGHT: notes */}
        <section style={{ padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
          <h2>Notes & transcripts</h2>
          <div style={{ display: "grid", gap: 8 }}>
            <label>HM conversation</label>
            <textarea value={hm} onChange={(e) => setHm(e.target.value)} rows={4} />

            <label>Recruiter notes</label>
            <textarea value={recruiter} onChange={(e) => setRecruiter(e.target.value)} rows={3} />

            <label>Job description (paste)</label>
            <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={3} />

            <label>TA leader convo / notes</label>
            <textarea value={ta} onChange={(e) => setTa(e.target.value)} rows={3} />

            <label>Candidate call notes / transcript</label>
            <textarea value={candidate} onChange={(e) => setCandidate(e.target.value)} rows={4} />
          </div>
          <button
            onClick={saveNotes}
            disabled={busy}
            style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, border: 0, cursor: "pointer" }}
          >
            {busy ? "Saving…" : "Save notes"}
          </button>
          {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </section>
      </div>

      {/* BELOW: artifact list (notes + files) */}
      <section style={{ marginTop: 24 }}>
        <h2>All items</h2>
        {artifacts.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {artifacts.map((a) => (
              <li key={a.id}>
                <strong>{a.kind}</strong> — {a.title || "(untitled)"}{" "}
                <span style={{ opacity: 0.6 }}>
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

