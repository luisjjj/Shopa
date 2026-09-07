import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { logAuthEvent } from "@/lib/auth-log";

const GENERIC_OK = "If an account exists for that email, a reset link is on its way.";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !String(email).includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const normalized = String(email).trim().toLowerCase().slice(0, 255);

  const limited = rateLimit(request, `recover:${normalized}`, 5, 60 * 60 * 1000);
  if (!limited.ok) {
    await logAuthEvent("recover_abuse", normalized);
    // Still generic: rate-limit must not reveal whether the email exists.
    return NextResponse.json({ ok: true, message: GENERIC_OK });
  }

  const supabase = createClient();
  const redirectTo = `${getAppBaseUrl()}/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo });
  if (error) {
    await logAuthEvent("recover_request", normalized, { error: error.message });
    // Supabase errors (e.g. unknown email, provider blocks) must not leak
    // account existence to the caller.
    return NextResponse.json({ ok: true, message: GENERIC_OK });
  }
  await logAuthEvent("recover_request", normalized);
  return NextResponse.json({ ok: true, message: GENERIC_OK });
}
