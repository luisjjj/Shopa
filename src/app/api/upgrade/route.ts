import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { origin } = new URL(request.url);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("Upgrade - auth user:", JSON.stringify(user, null, 2));
  console.log("Upgrade - auth error:", authError);

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const email = user.email;

  console.log("Upgrade - user email:", email);

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: `Invalid email address: ${email || "empty"}` },
      { status: 400 }
    );
  }

  const reference = `shopa_upgrade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = await initializeTransaction({
    email,
    amount: 5000,
    callback_url: `${origin}/api/upgrade/verify?reference=${reference}`,
    reference,
    metadata: {
      type: "subscription_upgrade",
      userId: user.id,
    },
  });

  console.log("Upgrade - paystack result:", JSON.stringify(result, null, 2));

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
