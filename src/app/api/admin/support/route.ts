import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { serverError } from "@/lib/api-error";

async function requireOwner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase();
  if (!user || !ownerEmail || user.email?.toLowerCase() !== ownerEmail) return null;
  return user;
}

// List threads with preview + unread-style sorting (latest first).
export async function GET(request: Request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  const service = createServiceRoleClient();

  try {
    if (threadId) {
      const { data: messages } = (await service
        .from("support_messages")
        .select("id, sender, body, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })
        .limit(200)) as unknown as {
        data: { id: string; sender: string; body: string; created_at: string }[] | null;
      };
      return NextResponse.json({ messages: messages || [] });
    }

    const { data: threads } = (await service
      .from("support_threads")
      .select("id, user_email, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100)) as unknown as {
      data: { id: string; user_email: string; status: string; updated_at: string }[] | null;
    };

    const withPreview = await Promise.all(
      (threads || []).map(async (t) => {
        const { data: last } = (await service
          .from("support_messages")
          .select("sender, body, created_at")
          .eq("thread_id", t.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()) as unknown as {
          data: { sender: string; body: string; created_at: string } | null;
        };
        return { ...t, last };
      })
    );
    return NextResponse.json({ threads: withPreview });
  } catch (e) {
    return serverError("admin-support:list", e, "Could not load messages");
  }
}

// Reply as admin: saved to the thread AND emailed to the user.
export async function POST(request: Request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { threadId, body, close } = await request.json().catch(() => ({}));
  if (!threadId || typeof threadId !== "string") {
    return NextResponse.json({ error: "threadId required" }, { status: 400 });
  }
  const service = createServiceRoleClient();

  try {
    const { data: thread } = (await service
      .from("support_threads")
      .select("id, user_email")
      .eq("id", threadId)
      .single()) as unknown as { data: { id: string; user_email: string } | null };
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const clean = String(body || "").trim().slice(0, 2000);
    if (close) {
      await service.from("support_threads").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", threadId);
      return NextResponse.json({ ok: true });
    }
    if (!clean) return NextResponse.json({ error: "Message is empty" }, { status: 400 });

    const { data: msg, error } = (await service
      .from("support_messages")
      .insert({ thread_id: threadId, sender: "admin", body: clean })
      .select("id, sender, body, created_at")
      .single()) as unknown as {
      data: { id: string; sender: string; body: string; created_at: string } | null;
      error: unknown;
    };
    if (error) throw error;
    await service.from("support_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

    const { sendEmail } = await import("@/lib/email");
    const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.shop").replace(/\/$/, "");
    if (thread.user_email.includes("@")) {
      sendEmail({
        to: thread.user_email,
        subject: "Reply from Shopa support",
        html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Shopa support replied</h2><p style="background:#f5f5f5;padding:12px;border-radius:8px;">${clean.replace(/</g, "&lt;")}</p><a href="${base}/dashboard" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Continue in chat</a></div>`,
      }).catch((e) => console.error("[admin-support] user email failed", e));
    }

    return NextResponse.json({ ok: true, message: msg });
  } catch (e) {
    return serverError("admin-support:reply", e, "Could not send reply");
  }
}
