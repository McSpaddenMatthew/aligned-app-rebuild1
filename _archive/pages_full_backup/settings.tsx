// pages/settings.tsx
import type { GetServerSideProps } from "next";
import Link from "next/link";

// Force SSR so Next.js won't pre-render this page at build time
export const getServerSideProps: GetServerSideProps = async () => {
  // If you have auth, you can redirect here.
  // Example:
  // const supabase = getSupabaseServer(ctx);
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session?.user) return { redirect: { destination: "/login", permanent: false } };
  return { props: {} };
};

export default function Settings() {
  return (
    <main className="min-h-screen p-8 bg-white text-[#0A0A0A]">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-slate-700">Minimal placeholder. Safe for deploy.</p>
        <Link href="/dashboard" className="mt-6 inline-block text-sm underline">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

