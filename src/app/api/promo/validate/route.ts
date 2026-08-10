import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { code, seller_id } = body;

  if (!code || !seller_id) {
    return NextResponse.json(
      { error: "Code and seller_id are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("seller_id", seller_id)
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !promo) {
    return NextResponse.json(
      { error: "Invalid promo code" },
      { status: 404 }
    );
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This promo code has expired" },
      { status: 400 }
    );
  }

  if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
    return NextResponse.json(
      { error: "This promo code has reached its usage limit" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    id: promo.id,
    code: promo.code,
    discount_percent: promo.discount_percent,
    discount_amount: promo.discount_amount,
  });
}
