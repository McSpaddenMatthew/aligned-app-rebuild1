// pages/dashboard.tsx
import type { GetServerSideProps } from "next";
import { createPagesServerClient, createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { redirect: { destination: "/login", permanent: false } };
  return { props: { email: session.user.email ?? "" } };
};

export default function Dashboard({ email }: { email: string }) {
  const supabase = createPagesBrowserClient();
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-700">Signed in as {email || "your account"}.</p>
      <button onClick={signOut} className="mt-6 rounded bg-black px-4 py-2 text-white">
        Sign out
      </button>
    </main>
  );
}
