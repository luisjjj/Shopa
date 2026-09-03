import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = formData.get("order_id") as string;
  if (!orderId) return NextResponse.redirect(new URL("/dashboard", request.url));
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  await supabase
    .from("orders")
    .delete()
    .eq("id", orderId)
    .eq("seller_id", user.id)
    .eq("paid", false)
    .eq("confirmed_by_buyer", false);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
