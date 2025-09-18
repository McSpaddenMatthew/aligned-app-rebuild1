'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // change to '../../lib/supabaseClient' if your path alias isn't set

type Row = {
  id: string;
  user_id: string;
  candidate_name: string;
  notes: string;
  resume_url: string | null;
  created_at: string;
};

/* ---------- trust-template + email helpers ---------- */
function trustTemplate(candidateName: string) {
  const name = candidateName?.trim() || '[Candidate]';
  return [
    'What You Shared – What the Candidate Brings',
    '• [Your priority #1] — [How the candidate meets it]',
    '• [Your priority #2] — [How the candidate meets it]',
    '• [Your priority #3] — [How the candidate meets it]',
    '',
    'Why This Candidate Was Selected',
    '• [1–3 bullets on why this profile matches the ask]',
    '',
    'Known Risks & Mitigations',
    '• Risk: [clear risk] — Mitigation: [how we’ll handle it]',
    '• Risk: [clear risk] — Mitigation: [how we’ll handle it]',
    '',
    'Outcomes Delivered',
    '• [Metric/Outcome 1]  |  [Context/Team/Tool]',
    '• [Metric/Outcome 2]  |  [Context/Team/Tool]',
    '• [Metric/Outcome 3]  |  [Context/Team/Tool]',
    '',
    `How ${name} Frames Data for Leadership Decisions`,
    '• [How they turn inputs into a decision for leadership]',
    '• [Examples of framing: tradeoffs, options, ROI, timelines]',
  ].join('\n');
}

function emailSubject(r: Row) {
  return `Candidate Summary — ${r.candidate_name}`;
}

function emailPlain(r: Row) {
  return [
    `Hi [Hiring Manager],`,
    ``,
    `Here’s the decision-ready summary for ${r.candidate_name}.`,
    ``,
    `— Fast Facts`,
    `• Name: ${r.candidate_name}`,
    r.resume_url ? `• Resume: ${r.resume_url}` : null,
    `• Date: ${new Date(r.created_at).toLocaleDateString()}`,
    ``,
    `— Summary`,
    r.notes,
    ``,
    `Next steps: Would you like me to schedule a 30-minute intro?`,
    ``,
    `— Sent via Aligned`,
  ].filter(Boolean).join('\n');
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
}

function emailHtml(r: Row) {
  return `
<div style="font-family: Inter, Arial, sans-serif; line-height:1.5;">
  <p>Hi [Hiring Manager],</p>
  <p>Here’s the decision-ready summary for <strong>${escapeHtml(r.candidate_name)}</strong>.</p>
  <h3 style="margin:16px 0 8px;">Fast Facts</h3>
  <ul style="margin:0 0 12px 18px;">
    <li><strong>Name:</strong> ${escapeHtml(r.candidate_name)}</li>
    ${r.resume_url ? `<li><strong>Resume:</strong> <a href="${escapeHtml(r.resume_url)}">${escapeHtml(r.resume_url)}</a></li>` : ''}
    <li><strong>Date:</strong> ${new Date(r.created_at).toLocaleDateString()}</li>
  </ul>
  <h3 style="margin:16px 0 8px;">Summary</h3>
  <pre style="white-space:pre-wrap;margin:0">${escapeHtml(r.notes)}</pre>
  <p>Next steps: Would you like me to schedule a 30-minute intro?</p>
  <p style="color:#475569;font-size:12px;">Sent via Aligned</p>
</div>`;
}

async function copyText(t: string) {
  await navigator.clipboard.writeText(t);
  alert('Copied to clipboard.');
}

// Some TS envs don't type ClipboardItem; use any.
async function copyHtml(html: string) {
  try {
    const item = new (window as any).ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) });
    await (navigator.clipboard as any).write([item]);
    alert('Rich email content copied.');
  } catch {
    await copyText(html.replace(/<[^>]+>/g, ''));
  }
}

/* ---------- component ---------- */
export default function CandidateSummaries() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ candidate_name: '', notes: '', resume_url: '' });

  // editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ candidate_name: string; notes: string; resume_url: string }>({
    candidate_name: '',
    notes: '',
    resume_url: '',
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function refresh() {
    const { data, error } = await supabase
      .from('candidate_summaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    setRows((data as Row[]) ?? []);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return alert('Please log in first.');
    const payload = {
      user_id: userId,
      candidate_name: form.candidate_name.trim(),
      notes: form.notes.trim(),
      resume_url: form.resume_url.trim() || null,
    };
    const { error } = await supabase.from('candidate_summaries').insert(payload);
    if (error) {
      alert(error.message);
      console.error(error);
      return;
    }
    setForm({ candidate_name: '', notes: '', resume_url: '' });
    await refresh();
  }

  function insertTrustTemplate() {
    setForm((s) => ({
      ...s,
      notes: s.notes?.trim()
        ? `${s.notes.trim()}\n\n${trustTemplate(s.candidate_name)}`
        : trustTemplate(s.candidate_name),
    }));
  }

  function beginEdit(row: Row) {
    setEditingId(row.id);
    setEditDraft({
      candidate_name: row.candidate_name,
      notes: row.notes,
      resume_url: row.resume_url ?? '',
    });
  }

  async function saveEdit(id: string) {
    const { error } = await supabase
      .from('candidate_summaries')
      .update({
        candidate_name: editDraft.candidate_name.trim(),
        notes: editDraft.notes.trim(),
        resume_url: editDraft.resume_url.trim() || null,
      })
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }
    setEditingId(null);
    await refresh();
  }

  async function deleteRow(id: string) {
    if (!confirm('Delete this summary?')) return;
    const { error } = await supabase.from('candidate_summaries').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    await refresh();
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Create form */}
      <form onSubmit={onCreate} className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="grow">
            <label className="block text-sm mb-1">Candidate name</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.candidate_name}
              onChange={(e) => setForm((s) => ({ ...s, candidate_name: e.target.value }))}
              required
            />
          </div>
          <button
            type="button"
            className="border rounded px-3 py-2 whitespace-nowrap"
            onClick={insertTrustTemplate}
            title="Insert your standard 5-section trust template into Notes"
          >
            Insert Trust Template
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={10}
            value={form.notes}
            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Paste raw notes or click 'Insert Trust Template' to start…"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Resume URL (optional)</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.resume_url}
            onChange={(e) => setForm((s) => ({ ...s, resume_url: e.target.value }))}
            placeholder="https://…"
          />
        </div>

        <button className="border rounded px-4 py-2" type="submit">
          Save summary
        </button>
      </form>

      {/* List of summaries */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Your summaries</h2>
        {rows.length === 0 ? (
          <div>No summaries yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="border rounded p-3 space-y-2">
              {editingId === r.id ? (
                <>
                  <div className="font-medium">Editing: {r.candidate_name}</div>
                  <div className="grid gap-2">
                    <input
                      className="border rounded px-3 py-2 w-full"
                      value={editDraft.candidate_name}
                      onChange={(e) => setEditDraft((s) => ({ ...s, candidate_name: e.target.value }))}
                    />
                    <textarea
                      className="border rounded px-3 py-2 w-full"
                      rows={10}
                      value={editDraft.notes}
                      onChange={(e) => setEditDraft((s) => ({ ...s, notes: e.target.value }))}
                    />
                    <input
                      className="border rounded px-3 py-2 w-full"
                      value={editDraft.resume_url}
                      onChange={(e) => setEditDraft((s) => ({ ...s, resume_url: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="border rounded px-3 py-1"
                      onClick={() => saveEdit(r.id)}
                    >
                      Save
                    </button>
                    <button
                      className="border rounded px-3 py-1"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium">{r.candidate_name}</div>
                  <div className="text-sm whitespace-pre-wrap">{r.notes}</div>
                  {r.resume_url && (
                    <a className="text-sm underline" href={r.resume_url} target="_blank">
                      resume
                    </a>
                  )}
                  <div className="text-xs opacity-70">{new Date(r.created_at).toLocaleString()}</div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      className="border rounded px-2 py-1 text-sm"
                      onClick={() => copyText(emailSubject(r))}
                    >
                      Copy Subject
                    </button>
                    <button
                      className="border rounded px-2 py-1 text-sm"
                      onClick={() => copyText(emailPlain(r))}
                    >
                      Copy Plain Text
                    </button>
                    <button
                      className="border rounded px-2 py-1 text-sm"
                      onClick={() => copyHtml(emailHtml(r))}
                    >
                      Copy HTML
                    </button>
                    <button
                      className="border rounded px-2 py-1 text-sm"
                      onClick={() => beginEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="border rounded px-2 py-1 text-sm"
                      onClick={() => deleteRow(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
