"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "@/lib/env";

/** Supabase client for Client Components (used later for Realtime messaging). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
