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
    .select("rating")
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = data || [];
  const count = reviews.length;
  const avg = count > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;

  return NextResponse.json({
    avgRating: Math.round(avg * 10) / 10,
    totalCount: count,
  });
}
