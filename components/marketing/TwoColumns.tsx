export default function TwoColumns() {
  return (
    <section className="section py-16">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="card p-6 order-2 md:order-1">
          <h3 className="font-semibold mb-2">Why Aligned?</h3>
          <p className="text-[var(--slate)]">
            Give hiring managers what they need: a concise, defensible, and comparable report.
            Recruiters stay in the driver’s seat—and decisions get faster and fairer.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-[4/3] rounded-2xl bg-[var(--slate-100)] border border-slate-200 grid place-items-center text-[var(--slate)]">
            Visual goes here
          </div>
        </div>
      </div>
    </section>
  );
}
