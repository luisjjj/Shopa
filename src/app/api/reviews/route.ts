import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { order_id, rating, comment } = body;

  if (!order_id || !rating) {
    return NextResponse.json(
      { error: "order_id and rating are required" },
      { status: 400 }
    );
  }

  const r = Number(rating);
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  if (typeof order_id !== "string" || order_id.length > 64) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  // Strip markup — comments render in dashboards and must not carry HTML.
  const cleanComment = typeof comment === "string"
    ? comment.replace(/[<>"']/g, "").trim().slice(0, 500) || null
    : null;

  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, product_id, buyer_name, paid")
    .eq("id", order_id)
    .single() as never as { data: { id: string; product_id: string; buyer_name: string; paid: boolean } | null };

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.paid) {
    return NextResponse.json(
      { error: "You can review once the seller confirms your payment" },
      { status: 403 }
    );
  }

  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "This order already has a review" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: order.product_id,
      order_id: order.id,
      buyer_name: order.buyer_name,
      rating: r,
      comment: cleanComment,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
