import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, sellerId, buyerName, buyerPhone, amount, productName } =
    body;

  if (!productId || !sellerId || !buyerName || !buyerPhone || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { origin } = new URL(request.url);
  const supabase = createClient();

  const { data: seller } = await supabase
    .from("users")
    .select("email")
    .eq("id", sellerId)
    .single();

  if (!seller || !seller.email || !seller.email.includes("@")) {
    return NextResponse.json({ error: "Seller not found or invalid email" }, { status: 404 });
  }

  const reference = `shopa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const { error: insertError } = await supabase.from("orders").insert({
    product_id: productId,
    seller_id: sellerId,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    amount,
    paystack_reference: reference,
    paid: false,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const result = await initializeTransaction({
    email: seller.email,
    amount,
    callback_url: `${origin}/api/verify?reference=${reference}&product=${productName}&amount=${amount}&buyer=${encodeURIComponent(buyerName)}`,
    reference,
    metadata: {
      productId,
      sellerId,
      buyerName,
      buyerPhone,
      custom_fields: [
        {
          display_name: "Product",
          variable_name: "product",
          value: productName,
        },
      ],
    },
  });

  if (!result.status) {
    return NextResponse.json(
      { error: result.message || "Payment initialization failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    authorization_url: result.data.authorization_url,
    reference,
  });
}
