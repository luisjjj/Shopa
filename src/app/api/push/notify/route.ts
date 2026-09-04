import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { createClient } = await import("@/lib/supabase/server");
  const authed = createClient();
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const supabase = createServiceRoleClient();

  const body = await request.json();
  const { userId, title, body: messageBody, url } = body;

  if (!userId || !title || !messageBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Users may only push to their own devices. Allowlist the target URL so
  // a compromised session can't turn notifications into phishing links.
  if (userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const target = typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard";

  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (fetchError || !subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  const webPush = (await import("web-push")).default;
  webPush.setVapidDetails(
    "mailto:hello@myshopa.com.ng",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const payload = JSON.stringify({
    title: String(title).slice(0, 120),
    body: String(messageBody).slice(0, 300),
    url: target,
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
