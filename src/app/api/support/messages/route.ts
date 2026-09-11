import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { botReplyFor } from "@/lib/support-bot";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-error";

const SUPPORT_INBOX = process.env.SUPPORT_EMAIL || "shopa.store.ng@gmail.com";

export async function POST(request: Request) {
  const limited = rateLimit(request, "support-msg", 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Slow down a little. Try again in a bit" }, { status: 429 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { body } = await request.json().catch(() => ({}));
  const clean = String(body || "").trim().slice(0, 2000);
  if (!clean) return NextResponse.json({ error: "Message is empty" }, { status: 400 });

  const service = createServiceRoleClient();
  try {
    let { data: thread } = (await service
      .from("support_threads")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle()) as unknown as { data: { id: string; status: string } | null };

    if (!thread) {
      const created = (await service
        .from("support_threads")
        .insert({ user_id: user.id, user_email: user.email || "" })
        .select("id, status")
        .single()) as unknown as { data: { id: string; status: string } | null; error: unknown };
      if (created.error) throw created.error;
      thread = created.data;
    }
    if (!thread) return NextResponse.json({ error: "Could not send message" }, { status: 500 });

    const isFirst = (
      (await service
        .from("support_messages")
        .select("id", { count: "exact", head: true })
        .eq("thread_id", thread.id)) as unknown as { count: number | null }
    ).count === 0;

    await service.from("support_messages").insert({ thread_id: thread.id, sender: "user", body: clean });
    await service.from("support_threads").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", thread.id);

    // Instant bot reply, saved to the thread like a human message.
    const { reply, confident } = botReplyFor(clean);
    const { data: botMsg } = (await service
      .from("support_messages")
      .insert({ thread_id: thread.id, sender: "bot", body: reply })
      .select("id, sender, body, created_at")
      .single()) as unknown as {
      data: { id: string; sender: string; body: string; created_at: string } | null;
    };

    // Route to a human by email: always on the first message, or whenever
    // the bot isn't confident. Replies happen in /admin and land back here.
    if (isFirst || !confident) {
      const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.shop").replace(/\/$/, "");
      sendEmail({
        to: SUPPORT_INBOX,
        subject: `Support: ${user.email} needs help`,
        html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>New support message</h2><p><b>${user.email}</b> wrote:</p><p style="background:#f5f5f5;padding:12px;border-radius:8px;">${clean.replace(/</g, "&lt;")}</p><p>Bot replied: ${confident ? "yes" : "no (fallback)"}.</p><a href="${base}/admin" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Reply in admin</a></div>`,
      }).catch((e) => console.error("[support] owner email failed", e));
    }

    return NextResponse.json({ ok: true, reply: botMsg });
  } catch (e) {
    const msg = String((e as { message?: string })?.message || e || "");
    if (msg.includes("support_threads") || (e as { code?: string })?.code === "42P01") {
      return NextResponse.json(
        { error: "Support chat is not set up yet. Run supabase/support-chat.sql" },
        { status: 500 }
      );
    }
    return serverError("support:message", e, "Could not send message. Try again.");
  }
}
