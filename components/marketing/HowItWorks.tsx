export default function HowItWorks() {
  const steps = [
    { title: 'Start with evidence', body: 'Capture the hiring manager’s words. Add candidate notes + resume for context.' },
    { title: 'From words to decisions', body: 'We turn priorities into criteria—clear, business-first, and comparable.' },
    { title: 'Share with confidence', body: 'Send one decision-ready report managers actually trust and use.' },
  ];

  return (
    <section id="how" className="section py-16">
      <h2 className="h2 mb-8">How it works</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="card p-5">
            <div className="size-8 rounded-xl mb-3 grid place-items-center text-white"
                 style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9A35)' }}>
              {i + 1}
            </div>
            <div className="font-semibold mb-1">{s.title}</div>
            <div className="text-sm text-[var(--slate)]">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
