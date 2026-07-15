import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { origin } = new URL(request.url);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const reference = `shopa_upgrade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = await initializeTransaction({
    email: profile.email,
    amount: 5000,
    callback_url: `${origin}/api/upgrade/verify?reference=${reference}`,
    reference,
    metadata: {
      type: "subscription_upgrade",
      userId: user.id,
    },
  });

  if (!result.status) {
    return NextResponse.json(
      { error: result.message || "Payment initialization failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    authorization_url: result.data.authorization_url,
    reference,
  });
}
