import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireSameOrigin } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Cookie-authenticated form posts must originate from our own pages.
  if (!requireSameOrigin(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  const formData = await request.formData();
  const orderId = formData.get("order_id") as string;
  const fulfilled = formData.get("fulfilled") as string;

  if (!orderId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const service = createServiceRoleClient();
  const { error } = await service
    .from("orders")
    .update({ fulfilled: fulfilled === "true" })
    .eq("id", orderId)
    .eq("seller_id", user.id);

  if (error) console.error("[fulfilled] update failed", error);

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
