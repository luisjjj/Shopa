import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchPlanStatus, FREE_PRODUCT_LIMIT, type PlanQueryClient } from "@/lib/premium";

async function countActive(supabase: PlanQueryClient, userId: string) {
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true);
  return count ?? 0;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { isPremium } = await fetchPlanStatus(supabase, user.id);
  if (!isPremium && (await countActive(supabase, user.id)) >= FREE_PRODUCT_LIMIT) {
    return NextResponse.json(
      { error: "Product limit reached — upgrade to Premium for unlimited products" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { name, price, description, image_url, stock, has_variants } = body;

  if (typeof name !== "string" || !name.trim() || name.trim().length > 120) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }
  if (!Number.isInteger(price) || price < 1) {
    return NextResponse.json({ error: "Price must be a whole naira amount ≥ ₦1" }, { status: 400 });
  }
  const stockNum = stock == null || stock === "" ? null : Number(stock);
  if (stockNum != null && (!Number.isInteger(stockNum) || stockNum < 0)) {
    return NextResponse.json({ error: "Stock must be a whole number ≥ 0" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: name.trim().slice(0, 120),
      price,
      description: typeof description === "string" && description.trim() ? description.trim().slice(0, 2000) : null,
      image_url: typeof image_url === "string" && image_url ? image_url.slice(0, 2000) : null,
      stock: stockNum,
      has_variants: !!has_variants,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, name, price, description, image_url, stock, has_variants, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("products")
    .select("id, is_active")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Activating a draft counts toward the free limit.
  if (is_active && !(existing as { is_active: boolean }).is_active) {
    const { isPremium } = await fetchPlanStatus(supabase, user.id);
    if (!isPremium && (await countActive(supabase, user.id)) >= FREE_PRODUCT_LIMIT) {
      return NextResponse.json(
        { error: "Product limit reached — upgrade to Premium for unlimited products" },
        { status: 403 }
      );
    }
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim() || name.trim().length > 120)) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }
  if (price !== undefined && (!Number.isInteger(price) || price < 1)) {
    return NextResponse.json({ error: "Price must be a whole naira amount ≥ ₦1" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim().slice(0, 120);
  if (price !== undefined) updates.price = price;
  if (description !== undefined)
    updates.description = typeof description === "string" && description.trim() ? description.trim().slice(0, 2000) : null;
  if (image_url !== undefined)
    updates.image_url = typeof image_url === "string" && image_url ? image_url.slice(0, 2000) : null;
  if (stock !== undefined)
    updates.stock = stock == null || stock === "" ? null : Number(stock);
  if (has_variants !== undefined) updates.has_variants = !!has_variants;
  if (is_active !== undefined) updates.is_active = !!is_active;

  if (updates.stock != null && (!Number.isInteger(updates.stock as number) || (updates.stock as number) < 0)) {
    return NextResponse.json({ error: "Stock must be a whole number ≥ 0" }, { status: 400 });
  }

  const { error } = await supabase.from("products").update(updates).eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
