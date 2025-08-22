// pages/index.tsx
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function Home() {
  const supabase = createPagesBrowserClient();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to Aligned</h1>
        <p className="text-gray-600">Please sign in to access your dashboard.</p>
        {session ? (
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded">
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
            Sign in
          </Link>
        )}
      </div>
    </main>
  );
}
