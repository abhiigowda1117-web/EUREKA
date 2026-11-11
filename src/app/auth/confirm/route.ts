import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

/**
 * Every link in a FORGE email (verify email, reset password) lands here.
 * We exchange the one-time token for a session, then send the user on.
 *
 * Supports both Supabase link styles:
 *   ?token_hash=...&type=signup|recovery|email   (recommended email templates — works across devices)
 *   ?code=...                                     (default PKCE links — must open in the same browser)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), "/dashboard");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  let failed = true;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = Boolean(error);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  }

  if (failed) return NextResponse.redirect(new URL("/auth/error", origin));
  const destination = type === "recovery" ? "/reset-password" : next;
  return NextResponse.redirect(new URL(destination, origin));
}
