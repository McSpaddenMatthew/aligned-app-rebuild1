type Summary = { id: string; role: string; manager: string; updated: string; status: 'Draft' | 'Shared' };

const mock: Summary[] = [
  { id: 'sum_01', role: 'Senior Backend Engineer', manager: 'A. Chen',  updated: 'Today',      status: 'Draft'  },
  { id: 'sum_02', role: 'Product Designer',         manager: 'R. Patel', updated: '2 days ago', status: 'Shared' },
];

export default function SummariesPage() {
  if (!mock.length) {
    return (
      <div className="card p-8 grid place-items-center text-center">
        <div className="size-12 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9A35)' }} />
        <h1 className="text-xl font-semibold mb-2">No summaries yet</h1>
        <p className="text-[var(--slate)] mb-4">Create your first candidate summary to get started.</p>
        <a href="/dashboard/new" className="btn btn-primary">New Summary</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Candidate Summaries</h1>
        <a href="/dashboard/new" className="btn btn-primary">New Summary</a>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr] px-5 py-3 text-sm text-[var(--slate)] border-b border-slate-200">
          <div>Role</div><div>Hiring Manager</div><div>Updated</div><div>Status</div>
        </div>
        {mock.map(s => (
          <a
            key={s.id}
            href={`/dashboard/summaries/${s.id}`}
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr] px-5 py-4 hover:bg-[var(--slate-50)] transition border-b last:border-b-0 border-slate-200"
          >
            <div className="font-medium">{s.role}</div>
            <div className="text-[var(--slate)]">{s.manager}</div>
            <div className="text-[var(--slate)]">{s.updated}</div>
            <div className="text-[var(--slate)]">{s.status}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
