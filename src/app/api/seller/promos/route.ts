import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchPlanStatus, type PlanQueryClient } from "@/lib/premium";

async function requireProPlus(supabase: PlanQueryClient, userId: string) {
  const { isProPlus } = await fetchPlanStatus(supabase, userId);
  if (!isProPlus) {
    return NextResponse.json(
      { error: "Pro+ required. Upgrade to create promo codes" },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promos: data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gated = await requireProPlus(supabase, user.id);
  if (gated) return gated;

  const body = await request.json().catch(() => ({}));
  const { code, discount_percent, discount_amount, max_uses, expires_at } = body;

  if (typeof code !== "string" || !code.trim() || code.trim().length > 24 || (!discount_percent && !discount_amount)) {
    return NextResponse.json(
      { error: "Code and discount (percent or amount) are required" },
      { status: 400 }
    );
  }

  if (discount_percent && (discount_percent < 1 || discount_percent > 100)) {
    return NextResponse.json(
      { error: "Discount percent must be between 1 and 100" },
      { status: 400 }
    );
  }

  // A fixed-amount discount must be a positive whole naira value.
  if (discount_amount != null && (!Number.isInteger(discount_amount) || discount_amount < 1)) {
    return NextResponse.json(
      { error: "Discount amount must be at least ₦1" },
      { status: 400 }
    );
  }

  if (expires_at && Number.isNaN(Date.parse(expires_at))) {
    return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      seller_id: user.id,
      code: code.toUpperCase(),
      discount_percent: discount_percent || null,
      discount_amount: discount_amount || null,
      max_uses: max_uses || 0,
      expires_at: expires_at || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A promo code with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promo: data });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gated = await requireProPlus(supabase, user.id);
  if (gated) return gated;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Promo code id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
