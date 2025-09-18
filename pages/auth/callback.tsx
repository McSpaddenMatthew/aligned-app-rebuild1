// pages/auth/callback.tsx
import { useEffect } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { createPagesBrowserClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const { data } = await supabase.auth.getSession();
  const next = (ctx.query.next as string) || "/dashboard";

  if (data.session) {
    return { redirect: { destination: next, permanent: false } };
  }
  return { props: { next } };
};

export default function AuthCallback({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const supabase = createPagesBrowserClient();
      await supabase.auth.exchangeCodeForSession(window.location.hash).catch(() => {});
      await router.replace(next);
    })();
  }, [router, next]);
  return null;
}

