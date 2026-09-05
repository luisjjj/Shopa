import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";
export async function POST(request: Request) {
  const { email, username } = await request.json().catch(() => ({}));
  if (!email || !String(email).includes("@")) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  // Strip markup from the display name, it lands inside an HTML email.
  const rawName = String(username || String(email).split("@")[0]);
  const name = rawName.replace(/[<>"']/g, "").trim().slice(0, 60) || "seller";
  const t = emailTemplates().welcome(name);
  const res = await sendEmail({ to: email, subject: t.subject, html: t.html });
  if ((res as { error?: string }).error) return NextResponse.json({ error: (res as { error: string }).error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
