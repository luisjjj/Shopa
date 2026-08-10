import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const orderId = body.order_id;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_phone, buyer_name, amount, seller_id")
    .eq("id", orderId)
    .eq("seller_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.buyer_phone) {
    return NextResponse.json({ error: "No phone number for this buyer" }, { status: 400 });
  }

  const phone = order.buyer_phone.replace("+", "").replace(/\s/g, "");
  const buyerName = order.buyer_name || "there";
  const message = encodeURIComponent(
    `Hi ${buyerName}! 👋 Just a friendly reminder about your order of ₦${order.amount.toLocaleString()} on Shopa. Please complete your payment so we can process your order. Thank you!`
  );

  const waUrl = `https://wa.me/${phone}?text=${message}`;

  return NextResponse.json({ url: waUrl });
}
