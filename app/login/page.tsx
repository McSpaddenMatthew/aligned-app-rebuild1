'use client';

export default function Login() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ padding: 24, border: '1px solid #ddd', borderRadius: 12 }}>
        <section>
          <h1 style={{ textAlign: 'center' }}>Evidence for every executive hire.</h1>
          <p>
            Aligned turns recruiter notes and call transcripts into decision-ready candidate reports for
            private equity operating partners. Every summary starts with your value-creation plan and ends
            with a clear yes, no, or not yet.
          </p>
          <ul>
            <li>Built for PE operating partners and portfolio leaders.</li>
            <li>Turns messy recruiter inputs into structured, comparable evidence.</li>
            <li>Built for recruiters. Trusted by operating partners.</li>
          </ul>
        </section>
        <section>
          <p>Sign in</p>
          <h2>Sign in to Aligned</h2>
          <p>
            Use your work email to get a secure magic link. This is how you access and share decision-ready
            candidate reports with your operating partners.
          </p>
        </section>
      </div>
    </main>
  );
}
