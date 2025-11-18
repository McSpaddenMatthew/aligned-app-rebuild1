import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set");
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
          path: options?.path ?? "/",
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: "",
          ...options,
          path: options?.path ?? "/",
          expires: new Date(0),
        });
      },
    },
  });
}

export function createSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role environment variables are not set");
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {},
    },
  });
}
