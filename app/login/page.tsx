"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setError(null);
    setStatus(null);

    if (!email) {
      setError("Enter an email to send the magic link.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) throw signInError;
      setStatus("Magic link sent. Check your inbox to continue.");
    } catch (err: any) {
      setError(err?.message || "Unable to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell auth-shell">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="eyebrow">Aligned Login</p>
          <h1>
            Passwordless access
            <span className="accent"> in under a minute.</span>
          </h1>
          <p className="lede">
            Use your email to receive a one-time magic link. No passwords, just
            a clean handoff into your dashboard.
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form__label" htmlFor="email">
            Work email
          </label>
          <div className="form__control">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <button className="button button--primary" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </div>
          {status && <p className="form__status">{status}</p>}
          {error && <p className="form__error">{error}</p>}
        </form>

        <div className="auth-footer">
          <p className="eyebrow">Fast path</p>
          <p className="lede">
            Already have the link? Open it from your email and we will finish
            the session on <strong>/auth/callback</strong> before redirecting to
            the dashboard.
          </p>
        </div>
      </section>
      <section className="auth-preview">
        <div className="preview__badge">Design language · Rosso Corsa</div>
        <div className="preview__panel">
          <p className="panel__label">What you get</p>
          <ul>
            <li>Luxury-grade red/black palette tuned for focus.</li>
            <li>Supabase magic link flow wired to the callback route.</li>
            <li>Dashboard tiles highlighting pipeline health.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
