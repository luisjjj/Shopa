import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getBaseUrl(request: Request): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const origin = request.headers.get("origin") || "";
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const env = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (host && !host.includes("localhost") && host.includes(".")) return `https://${host.replace(/^https?:\/\//, "")}`;
  if (origin && !origin.includes("localhost")) return origin.replace(/\/$/, "");
  if (vercel && !vercel.includes("localhost")) return vercel;
  if (env && !env.includes("localhost")) return env.replace(/\/$/, "");
  if (host) return host.startsWith("http") ? host : `https://${host}`;
  if (origin) return origin;
  if (vercel) return vercel;
  return env || "http://localhost:3000";
}

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  const supabase = createClient();
  const baseUrl = getBaseUrl(request);
  const redirectTo = `${baseUrl}/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, redirectTo });
}
