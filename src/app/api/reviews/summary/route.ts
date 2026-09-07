import { createServiceRoleClient } from "@/lib/supabase/service";
import { serverError } from "@/lib/api-error";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  // Service role: storefront visitors are anonymous, so the server reads on
  // their behalf. Writes stay locked down (see product-reviews-rls.sql).
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) {
    return serverError("reviews:summary", error, "Could not load ratings. Try again.");
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
