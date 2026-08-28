import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";
export async function POST(request: Request) {
  const { email, username } = await request.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  const t = emailTemplates().welcome(username || email.split("@")[0]);
  const res = await sendEmail({ to: email, subject: t.subject, html: t.html });
  if ((res as { error?: string }).error) return NextResponse.json({ error: (res as { error: string }).error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
