import type { GetServerSideProps } from "next";
import { useMemo, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });

export default function Login() {
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/login",
      },
    });
    setMsg(error ? error.message : "Check your email for the magic link.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-white text-[#0A0A0A]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="you@company.com"
          />
          <button type="submit" className="w-full rounded bg-[#0A0A0A] px-4 py-2 text-white">
            Send magic link
          </button>
        </form>
        {msg && <p className="mt-4 text-sm text-slate-700">{msg}</p>}
        <p className="mt-10 text-xs text-slate-500">© {String(new Date().getFullYear())} Aligned</p>
      </div>
    </main>
  );
}
