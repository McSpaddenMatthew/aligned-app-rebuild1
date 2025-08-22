// pages/login.tsx
import type { GetServerSideProps } from "next";
import { useMemo, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

// Force SSR so Vercel doesn't try to prerender at build-time
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default function Login() {
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMsg("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // after clicking the magic link, Supabase will send the hash to this page
          // and your index.tsx will forward it to /api/auth/callback
          emailRedirectTo:
            (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/login",
        },
      });
      if (error) throw error;
      setStatus("sent");
      setMsg("Check your email for the magic link.");
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Something went wrong.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-white text-[#0A0A0A]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-2 text-slate-700">We’ll email you a magic link.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="you@company.com"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending" || email.length === 0}
            className="w-full rounded bg-[#0A0A0A] px-4 py-2 text-white disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-slate-700">{msg}</p>}

        <p className="mt-10 text-xs text-slate-500">
          © {String(new Date().getFullYear())} Aligned
        </p>
      </div>
    </main>
  );
}
