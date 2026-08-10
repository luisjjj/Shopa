import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, sellerId, buyerName, buyerPhone, amount, promoCodeId, variantId } =
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

  let finalAmount = amount;

  if (variantId) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("price_override, stock, is_active")
      .eq("id", variantId)
      .eq("product_id", productId)
      .single();

    if (!variant || !variant.is_active) {
      return NextResponse.json({ error: "Variant not found" }, { status: 400 });
    }

    if (variant.stock != null && variant.stock <= 0) {
      return NextResponse.json({ error: "Variant is out of stock" }, { status: 400 });
    }

    if (variant.price_override != null) {
      finalAmount = variant.price_override;
    }
  }

  const reference = `shopa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      product_id: productId,
      seller_id: sellerId,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      amount: finalAmount,
      paystack_reference: reference,
      paid: false,
      confirmed_by_buyer: false,
      promo_code_id: promoCodeId || null,
      variant_id: variantId || null,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (promoCodeId) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("used_count")
      .eq("id", promoCodeId)
      .single();
    if (promo) {
      await supabase
        .from("promo_codes")
        .update({ used_count: promo.used_count + 1 })
        .eq("id", promoCodeId);
    }
  }

  return NextResponse.json({
    orderId: order.id,
    bankName: seller.bank_name,
    accountNumber: seller.account_number,
    accountName: seller.account_name,
    reference,
  });
}
