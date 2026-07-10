import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = formData.get("order_id") as string;
  const fulfilled = formData.get("fulfilled") as string;

  if (!orderId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const supabase = createClient();
  await supabase
    .from("orders")
    .update({ fulfilled: fulfilled === "true" })
    .eq("id", orderId);

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
