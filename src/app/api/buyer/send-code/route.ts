import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail, emailTemplates } from "@/lib/email";
import { hashOtp } from "@/lib/security";

function isMissingTable(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message || error || "");
  return msg.includes("buyer_otps") || (error as { code?: string })?.code === "42P01";
}

const MAX_SENDS_PER_HOUR = 5;

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !/^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(String(email).trim())) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const normalized = String(email).trim().toLowerCase();
  const supabase = createServiceRoleClient();

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentSends, error: recentError } = await supabase
    .from("buyer_otps")
    .select("id, created_at")
    .eq("email", normalized)
    .gt("created_at", hourAgo)
    .order("created_at", { ascending: false });

  if (recentError && !isMissingTable(recentError)) {
    return NextResponse.json({ error: "Could not send code. Try again" }, { status: 500 });
  }
  if (recentError && isMissingTable(recentError)) {
    return NextResponse.json(
      { error: "Email verification is not set up yet, seller: run supabase/buyer-otps.sql" },
      { status: 500 }
    );
  }
  if (recentSends && recentSends.length >= MAX_SENDS_PER_HOUR) {
    return NextResponse.json({ error: "Too many codes sent. Try again in an hour" }, { status: 429 });
  }
  const latest = recentSends?.[0] as { created_at: string } | undefined;
  if (latest && Date.now() - new Date(latest.created_at).getTime() < 60 * 1000) {
    return NextResponse.json({ error: "Code just sent. Wait a minute before retrying" }, { status: 429 });
  }

  const code = String(randomInt(100000, 1000000));
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  // Store only a hash, a DB read must not reveal usable codes.
  // attempts starts at 0; verify-code carries attempts forward on resend
  // by leaving older rows until expiry cleanup (see below).
  const { error: insertError } = await supabase
    .from("buyer_otps")
    .insert({ email: normalized, code: hashOtp(code), expires_at, attempts: 0 });

  if (insertError) {
    return NextResponse.json({ error: "Could not send code. Try again" }, { status: 500 });
  }

  const t = emailTemplates().buyerOtp(code);
  const res = await sendEmail({ to: normalized, subject: t.subject, html: t.html });
  const sendError = (res as { error?: string }).error;
  if (sendError) {
    console.error("[send-code] brevo send failed", sendError);
    await supabase.from("buyer_otps").delete().eq("email", normalized).gt("created_at", hourAgo);
    const hint = sendError.includes("sender") || sendError.includes("5.7.8") || sendError.includes("535")
      ? "Email service rejected the send, seller: verify the sender address in Brevo"
      : "Could not send email. Check the address and try again";
    return NextResponse.json({ error: hint }, { status: 500 });
  }

  // Lazily drop expired rows so the table stays small.
  await supabase.from("buyer_otps").delete().lt("expires_at", new Date().toISOString());

  return NextResponse.json({ ok: true });
}
