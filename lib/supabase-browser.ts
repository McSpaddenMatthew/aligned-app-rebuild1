// lib/supabase-browser.ts
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

let client: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function getSupabaseBrowser() {
  if (!client) client = createBrowserSupabaseClient();
  return client;
}
