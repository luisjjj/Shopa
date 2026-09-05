import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { hashOtp } from "@/lib/security";

export async function POST(request: Request) {
  const { email, code } = await request.json().catch(() => ({}));
  if (!email || !code) {
    return NextResponse.json({ error: "Email and code required" }, { status: 400 });
  }
  const normalized = String(email).trim().toLowerCase();
  const supabase = createServiceRoleClient();

  const { data: row, error } = await supabase
    .from("buyer_otps")
    .select("id, code, expires_at, verified_at, attempts")
    .eq("email", normalized)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle() as never as { data: { id: string; code: string; expires_at: string; verified_at: string | null; attempts: number } | null; error: unknown };

  if (error || !row) {
    return NextResponse.json({ error: "No code found. Request a new one" }, { status: 400 });
  }
  if ((row.attempts || 0) >= 5) {
    return NextResponse.json({ error: "Too many attempts. Request a new code" }, { status: 429 });
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Code expired. Request a new one" }, { status: 400 });
  }
  // Codes are stored hashed; compare hashes only.
  if (hashOtp(String(code)) !== row.code) {
    await supabase.from("buyer_otps").update({ attempts: (row.attempts || 0) + 1 }).eq("id", row.id);
    return NextResponse.json({ error: "Wrong code. Check and try again" }, { status: 400 });
  }

  await supabase.from("buyer_otps").update({ verified_at: new Date().toISOString() }).eq("id", row.id);
  return NextResponse.json({ ok: true });
}
