import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, title, body: messageBody, url } = body;

  if (!userId || !title || !messageBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (fetchError || !subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  const webPush = (await import("web-push")).default;
  webPush.setVapidDetails(
    "mailto:hello@shopa-store.name.ng",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const payload = JSON.stringify({
    title,
    body: messageBody,
    url: url || "/dashboard",
  });

  let sent = 0;
  const failedEndpoints: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
      sent++;
    } catch {
      failedEndpoints.push(sub.endpoint);
    }
  }

  if (failedEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", failedEndpoints);
  }

  return NextResponse.json({ success: true, sent });
}
