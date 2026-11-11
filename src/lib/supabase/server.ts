import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * It acts AS THE LOGGED-IN USER (via their auth cookie), so every query is
 * filtered by Row Level Security. Create a new one per request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. That's fine: src/proxy.ts
          // refreshes the session on every request before the page renders.
        }
      },
    },
  });
}
