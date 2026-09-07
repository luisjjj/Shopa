import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logAuthEvent } from "@/lib/auth-log";

const ALLOWED = new Set([
  "login_failed",
  "login_locked",
  "recover_request",
  "otp_failed",
]);

export async function POST(request: Request) {
  const limited = rateLimit(request, "authlog", 30, 10 * 60 * 1000);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { type, identifier } = await request.json().catch(() => ({}));
  if (!type || !ALLOWED.has(String(type))) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
  await logAuthEvent(
    String(type) as "login_failed",
    String(identifier || "unknown").slice(0, 255)
  );
  return NextResponse.json({ ok: true });
}
