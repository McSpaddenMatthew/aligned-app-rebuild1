export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-2">Welcome back</h1>
        <p className="text-[var(--slate)]">Your summaries, activity, and quick actions live here.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <a href="/dashboard/new" className="card p-5 hover:shadow-md transition">
          <div className="font-semibold mb-1">Create a summary</div>
          <div className="text-sm text-[var(--slate)]">Start a new candidate report</div>
        </a>
        <a href="/dashboard/summaries" className="card p-5 hover:shadow-md transition">
          <div className="font-semibold mb-1">Recent submissions</div>
          <div className="text-sm text-[var(--slate)]">Review what’s new</div>
        </a>
        <a href="/dashboard/summaries" className="card p-5 hover:shadow-md transition">
          <div className="font-semibold mb-1">Share a report</div>
          <div className="text-sm text-[var(--slate)]">Send to a hiring manager</div>
        </a>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-2">Today</h2>
        <div className="text-sm text-[var(--slate)]">No scheduled tasks yet.</div>
      </div>
    </div>
  );
}
