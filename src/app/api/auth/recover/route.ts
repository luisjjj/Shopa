import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/security";

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !String(email).includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const supabase = createClient();
  // Redirect target comes from allowlisted config only — never from
  // Host/X-Forwarded-Host/Origin headers (reset-token theft).
  const redirectTo = `${getAppBaseUrl()}/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(String(email).trim(), { redirectTo });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
