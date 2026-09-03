import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail, emailTemplates } from "@/lib/email";

function isMissingTable(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message || error || "");
  return msg.includes("buyer_otps") || (error as { code?: string })?.code === "42P01";
}

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !String(email).includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const normalized = String(email).trim().toLowerCase();
  const supabase = createServiceRoleClient();

  const { data: recent, error: recentError } = await supabase
    .from("buyer_otps")
    .select("created_at")
    .eq("email", normalized)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentError && !isMissingTable(recentError)) {
    return NextResponse.json({ error: "Could not send code — try again" }, { status: 500 });
  }
  if (recentError && isMissingTable(recentError)) {
    return NextResponse.json(
      { error: "Email verification is not set up yet — seller: run supabase/buyer-otps.sql" },
      { status: 500 }
    );
  }
  if (recent && Date.now() - new Date(recent.created_at as string).getTime() < 60 * 1000) {
    return NextResponse.json({ error: "Code just sent — wait a minute before retrying" }, { status: 429 });
  }

  await supabase.from("buyer_otps").delete().eq("email", normalized);

  const code = String(randomInt(100000, 1000000));
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { error: insertError } = await supabase
    .from("buyer_otps")
    .insert({ email: normalized, code, expires_at });

  if (insertError) {
    return NextResponse.json({ error: "Could not send code — try again" }, { status: 500 });
  }

  const t = emailTemplates().buyerOtp(code);
  const res = await sendEmail({ to: normalized, subject: t.subject, html: t.html });
  if ((res as { error?: string }).error) {
    return NextResponse.json({ error: "Could not send email — check the address" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
