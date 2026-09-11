import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { serverError } from "@/lib/api-error";

function isMissingTable(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message || error || "");
  return msg.includes("support_threads") || (error as { code?: string })?.code === "42P01";
}

// Returns the caller's thread (creating it on first use) with messages.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
    if (!thread) return NextResponse.json({ error: "Could not open support chat" }, { status: 500 });

    const { data: messages } = (await service
      .from("support_messages")
      .select("id, sender, body, created_at")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true })
      .limit(100)) as unknown as {
      data: { id: string; sender: string; body: string; created_at: string }[] | null;
    };

    return NextResponse.json({ threadId: thread.id, status: thread.status, messages: messages || [] });
  } catch (e) {
    if (isMissingTable(e)) {
      return NextResponse.json(
        { error: "Support chat is not set up yet. Run supabase/support-chat.sql" },
        { status: 500 }
      );
    }
    return serverError("support:thread", e, "Could not open support chat. Try again.");
  }
}
