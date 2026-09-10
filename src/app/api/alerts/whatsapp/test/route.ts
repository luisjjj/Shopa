import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-error";
import { sendTemplateMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const limited = rateLimit(request, "whatsapp-test", 3, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many test pings. Try again later" },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("whatsapp_number")
      .eq("id", user.id)
      .single();

    const to = (profile as { whatsapp_number?: string | null } | null)?.whatsapp_number || "";
    if (!to) {
      return NextResponse.json(
        { error: "Save your WhatsApp number first, then send a test ping" },
        { status: 400 }
      );
    }

    const sent = await sendTemplateMessage(to, "hello_world", "en_US", []);
    if (!sent) {
      console.log("[whatsapp-test] failed", { userId: user.id });
      return NextResponse.json(
        { error: "Could not send the test ping. Check the number and try again" },
        { status: 502 }
      );
    }

    console.log("[whatsapp-test] sent", { userId: user.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError("whatsapp-test", e);
  }
}
