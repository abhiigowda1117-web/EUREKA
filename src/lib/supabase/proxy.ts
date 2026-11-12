import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/env";

/** Routes that require a logged-in user. Real authorisation still happens on the server + RLS. */
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/onboarding", "/projects/new", "/reset-password"];
/** Routes a logged-in user has no reason to see. */
const GUEST_ONLY = ["/login", "/signup", "/forgot-password"];

/**
 * Runs before every request (see src/proxy.ts):
 *  1. Refreshes the Supabase session cookie if it's about to expire.
 *  2. Redirects anonymous visitors away from private pages (fast, optimistic check).
 *
 * This is a convenience layer, NOT the security boundary. Every private page
 * and Server Action re-checks the user (src/lib/auth.ts), and the database
 * enforces Row Level Security regardless of what the app does.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let response = NextResponse.next({ request });
  let isLoggedIn = false; // Without Supabase configured, everyone is a guest.

  if (isSupabaseConfigured) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Write refreshed tokens to both the request (for this render) and the response (for the browser).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    });
    // IMPORTANT: getClaims() validates the JWT. Don't put code between
    // createServerClient and this call, or sessions may randomly log out.
    const { data } = await supabase.auth.getClaims();
    isLoggedIn = Boolean(data?.claims?.sub);
  }

  const redirectTo = (path: string, params: Record<string, string> = {}) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = new URLSearchParams(params).toString();
    const redirect = NextResponse.redirect(url);
    // Carry any refreshed auth cookies over to the redirect response.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isLoggedIn && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return redirectTo("/login", { next: pathname + search });
  }
  if (isLoggedIn && GUEST_ONLY.includes(pathname)) {
    return redirectTo("/dashboard");
  }
  return response;
}
