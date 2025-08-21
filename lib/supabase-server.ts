// lib/supabase-server.ts
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

/** For getServerSideProps usage (SSR). */
export function getSupabaseServer(ctx: GetServerSidePropsContext) {
  return createServerSupabaseClient(ctx);
}

/** For API routes. Reads/writes auth cookies on the response. */
export function getSupabaseServerApi(req: NextApiRequest, res: NextApiResponse) {
  return createServerSupabaseClient({ req, res });
}
