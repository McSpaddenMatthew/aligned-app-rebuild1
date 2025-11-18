import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

function getRedirectUrl() {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return window.location.origin;
}

function LoginForm() {
  "use client";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    startTransition(async () => {
      const redirectTo = `${getRedirectUrl()}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setMessage("Magic link sent. Check your email to continue.");
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <div className="text-sm font-medium text-primaryBlack">Email</div>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </label>
      <Button type="submit" disabled={isPending} className="w-full justify-center">
        {isPending ? "Sending..." : "Send magic link"}
      </Button>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-lightGray">
      <Shell className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slateGray">Aligned</p>
            <h1 className="text-2xl font-semibold">Magic link login</h1>
            <p className="text-sm text-slateGray">No passwords. Just evidence-ready reports.</p>
          </div>
          <div className="mt-6">
            <LoginForm />
          </div>
        </Card>
      </Shell>
    </main>
  );
}
