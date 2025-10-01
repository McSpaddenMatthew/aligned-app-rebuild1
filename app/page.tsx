// app/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const signedInEmail = session?.user?.email ?? null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-semibold">Welcome to Aligned</h1>
        <p className="text-gray-600 mt-2">
          Create candidate summaries and share email-ready previews.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {!signedInEmail ? (
            <>
              <Link
                href="/login?next=/dashboard"
                className="rounded-md bg-black text-white px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/summaries/new"
                className="rounded-md border px-4 py-2"
              >
                Try the editor
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600 mr-2">
                Signed in as <strong>{signedInEmail}</strong>
              </span>
              <Link
                href="/dashboard"
                className="rounded-md bg-black text-white px-4 py-2"
              >
                Go to dashboard
              </Link>
              <Link
                href="/summaries/new"
                className="rounded-md border px-4 py-2"
              >
                New summary
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          You can always return here at <code>/</code>. No automatic redirects.
        </p>
      </div>
    </main>
  );
}



