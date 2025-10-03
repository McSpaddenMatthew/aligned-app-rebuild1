type Props = { params: { id: string } };

export default function SummaryDetail({ params }: Props) {
  const { id } = params;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Summary: {id}</h1>
        <div className="flex gap-2">
          <a href="/dashboard/summaries" className="btn">Back</a>
          <button className="btn btn-primary" disabled>Share (coming soon)</button>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-[var(--slate)]">
          This is a placeholder detail view. We’ll populate it with the hiring manager’s
          priorities, candidate evidence, and a decision-ready report.
        </p>
      </div>
    </div>
  );
}
