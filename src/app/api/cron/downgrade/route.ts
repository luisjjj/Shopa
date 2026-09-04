import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireCronSecret } from "@/lib/security";

export async function GET(request: Request) {
  if (!requireCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const { data: expiredPremium } = await supabase
    .from("users")
    .select("id")
    .eq("is_premium", true)
    .lt("premium_until", now)
    .not("premium_until", "is", null);

  const { data: expiredPro } = await supabase
    .from("users")
    .select("id")
    .eq("is_pro_plus", true)
    .lt("pro_plus_until", now)
    .not("pro_plus_until", "is", null);

  let downgradedPremium = 0;
  let downgradedPro = 0;

  if (expiredPremium && expiredPremium.length > 0) {
    const ids = expiredPremium.map((u) => u.id);
    const { error } = await supabase.from("users").update({ is_premium: false }).in("id", ids);
    if (!error) downgradedPremium = ids.length;
  }
  if (expiredPro && expiredPro.length > 0) {
    const ids = expiredPro.map((u) => u.id);
    const { error } = await supabase.from("users").update({ is_pro_plus: false }).in("id", ids);
    if (!error) downgradedPro = ids.length;
  }

  return NextResponse.json({ downgradedPremium, downgradedPro, checkedAt: now });
}

export async function POST(request: Request) {
  return GET(request);
}
