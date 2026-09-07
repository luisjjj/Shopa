import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { serverError } from "@/lib/api-error";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, p256dh, auth: authKey } = body;

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Missing push subscription fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth: authKey,
      },
      { onConflict: "user_id,endpoint" }
    );

  if (error) {
    return serverError("push:subscribe", error, "Could not turn on notifications. Try again.");
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return serverError("push:unsubscribe", error, "Could not turn off notifications. Try again.");
  }

  return NextResponse.json({ success: true });
}
