import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchPlanStatus, type PlanQueryClient } from "@/lib/premium";

async function requireProPlus(supabase: PlanQueryClient, userId: string) {
  const { isProPlus } = await fetchPlanStatus(supabase, userId);
  if (!isProPlus) {
    return NextResponse.json(
      { error: "Pro+ required — upgrade to use product variants" },
      { status: 403 }
    );
  }
  return null;
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get("product_id");

  if (!product_id) {
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", product_id)
    .eq("user_id", user.id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ variants: data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { product_id, name, stock, price_override } = body;

  if (!product_id || typeof name !== "string" || !name.trim() || name.trim().length > 60) {
    return NextResponse.json(
      { error: "Missing product_id or name" },
      { status: 400 }
    );
  }

  const gated = await requireProPlus(supabase, user.id);
  if (gated) return gated;

  // Prices feed checkout totals directly: non-negative whole naira only,
  // otherwise a negative override could zero out an order.
  const stockNum = stock == null || stock === "" ? null : Number(stock);
  const priceNum = price_override == null || price_override === "" ? null : Number(price_override);
  if (stockNum != null && (!Number.isInteger(stockNum) || stockNum < 0)) {
    return NextResponse.json({ error: "Stock must be a whole number ≥ 0" }, { status: 400 });
  }
  if (priceNum != null && (!Number.isInteger(priceNum) || priceNum < 0)) {
    return NextResponse.json({ error: "Price override must be a whole naira amount ≥ 0" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", product_id)
    .eq("user_id", user.id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id,
      name: name.trim().slice(0, 60),
      stock: stockNum,
      price_override: priceNum,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ variant: data });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const gated = await requireProPlus(supabase, user.id);
  if (gated) return gated;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing variant id" }, { status: 400 });
  }

  const { data: variant } = await supabase
    .from("product_variants")
    .select("product_id")
    .eq("id", id)
    .single();

  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", variant.product_id)
    .eq("user_id", user.id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
