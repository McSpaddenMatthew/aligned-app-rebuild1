"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus("error");
      console.error(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white">
      <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign in to Aligned</h1>
        <form onSubmit={sendMagicLink} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-gray-700 focus:outline-none focus:border-[#FF6B35]"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-3 bg-[#FF6B35] hover:bg-[#e65a29] rounded-xl font-semibold text-black transition"
          >
            {status === "sending" ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
        {status === "sent" && (
          <p className="mt-4 text-green-400 text-center">
            Magic link sent! Check your email.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-red-400 text-center">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </div>
  );
}


