/**
 * Public Supabase settings. These are SAFE to expose to the browser: the
 * publishable (anon) key only grants what our Row Level Security allows.
 *
 * NEVER put the service-role / secret key in a NEXT_PUBLIC_ variable.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False until .env.local is filled in — the UI shows a setup notice instead of crashing. */
// Placeholder values copied from .env.example count as "not configured".
export const isSupabaseConfigured =
  /^https?:\/\/.+/.test(supabaseUrl) &&
  !supabaseUrl.includes("your-project-ref") &&
  supabaseKey.length > 20 &&
  !supabaseKey.includes("xxx");

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
