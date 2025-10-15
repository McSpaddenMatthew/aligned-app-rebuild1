'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// ---- Supabase envs ----
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// ---- Helpers ----
type HashParams = Record<string, string>;
function parseHash(hash: string): HashParams {
  const h = hash.startsWith('#') ? hash.slice(1) : hash;
  return h.split('&').reduce<HashParams>((acc, kv) => {
    const [k, v] = kv.split('=');
    if (k) acc[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    return acc;
  }, {});
}

// -------------------------------
// Inner content (uses hooks)
// -------------------------------
function LoginPageContent() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnon), []);

  // Handle return from Supabase (hash tokens OR PKCE code) and already-signed-in case
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled && session) {
        router.replace(next);
        return;
      }

      // Hash style: /login#access_token=...&refresh_token=...
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
        const params = parseHash(window.location.hash);
        history.replaceState(null, '', window.location.pathname + window.location.search); // clear hash
        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (!cancelled && !error) router.replace(next);
          return;
        }
      }

      // PKCE code style: /login?code=...
      const code = search.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled && !error) router.replace(next);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, router, next, search]);

  // Send magic link
  const sendMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setNotice(null);

    const emailRedirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login?next=${encodeURIComponent(next)}`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    if (error) setNotice({ kind: 'err', text: error.message });
    else setNotice({ kind: 'ok', text: 'Magic link sent — check your email.' });

    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top nav */}
      <header className="w-full border-b">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-black" />
            <span className="font-semibold">Aligned</span>
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium border hover:bg-gray-50"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero + form */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Hero copy */}
          <section>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Hiring decisions need evidence. <br className="hidden md:block" />
              Recruiters need trust. <span className="text-[#FF6B35]">Meet the bridge.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Aligned turns messy inputs into decision-ready reports that hiring managers trust.
            </p>
            <ul className="mt-8 space-y-3 text-gray-800">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-black" />
                Start with the hiring manager’s words.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-black" />
                From words to decisions — structured, comparable, executive-ready.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-black" />
                Deliver with confidence straight to their inbox.
              </li>
            </ul>
          </section>

          {/* Login card */}
          <section>
            <div className="rounded-2xl border shadow-sm p-8">
              <h2 className="text-2xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-gray-500">
                Use your email and we’ll send you a magic link.
              </p>

              <form onSubmit={sendMagic} className="mt-6 space-y-4">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-2xl px-4 py-3 font-medium bg-black text-white hover:opacity-90 disabled:opacity-60"
                >
                  {sending ? 'Sending…' : 'Send Magic Link'}
                </button>
              </form>

              {notice && (
                <p
                  className={`mt-4 text-sm ${
                    notice.kind === 'err' ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {notice.text}
                </p>
              )}

              <p className="mt-6 text-xs text-gray-500">
                You’ll be returned to <code>{next}</code> after you click the link.
              </p>
            </div>

            {/* Preview tip */}
            <p className="mt-4 text-xs text-gray-400">
              Debugging? Use the same domain (prod vs preview) that sent the email link.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Aligned</span>
          <span>Built for recruiters. Trusted by hiring managers.</span>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------
// Suspense wrapper (required for useSearchParams)
// -------------------------------
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading login page…</div>}>
      <LoginPageContent />
    </Suspense>
  );
}


