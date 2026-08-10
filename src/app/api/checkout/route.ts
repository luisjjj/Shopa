import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, sellerId, buyerName, buyerPhone, amount } =
    body;

  if (!productId || !sellerId || !buyerName || !buyerPhone || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: seller } = await supabase
    .from("users")
    .select("bank_name, account_number, account_name")
    .eq("id", sellerId)
    .single();

  if (!seller || !seller.bank_name || !seller.account_number || !seller.account_name) {
    return NextResponse.json(
      { error: "Seller has not set up bank details yet" },
      { status: 400 }
    );
  }

  const reference = `shopa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      product_id: productId,
      seller_id: sellerId,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      amount,
      paystack_reference: reference,
      paid: false,
      confirmed_by_buyer: false,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    bankName: seller.bank_name,
    accountNumber: seller.account_number,
    accountName: seller.account_name,
    reference,
  });
}
