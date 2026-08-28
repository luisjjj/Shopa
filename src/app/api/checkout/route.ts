import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, sellerId, buyerName, buyerPhone, buyerEmail, amount, promoCodeId, variantId } =
    body;

  if (!productId || !sellerId || !buyerName || !buyerPhone || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: seller } = await supabase
    .from("users")
    .select("bank_name, account_number, account_name, email, username")
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

  let order: { id: string } | null = null;
  let insertError: { message: string } | null = null as unknown as null;
  const payload: Record<string, unknown> = {
    product_id: productId,
    seller_id: sellerId,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    buyer_email: buyerEmail || null,
    amount: finalAmount,
    paystack_reference: reference,
    paid: false,
    confirmed_by_buyer: false,
    promo_code_id: promoCodeId || null,
    variant_id: variantId || null,
  };
  const res: { data: { id: string } | null; error: { message: string } | null } = await supabase.from("orders").insert(payload).select("id").single() as never;
  order = res.data; insertError = res.error;
  if (insertError && String(insertError.message).includes("buyer_email")) {
    delete payload.buyer_email;
    const r2: { data: { id: string } | null; error: { message: string } | null } = await supabase.from("orders").insert(payload).select("id").single() as never;
    order = r2.data; insertError = r2.error;
  }

  if (insertError) {
    return NextResponse.json({ error: (insertError as { message: string }).message }, { status: 500 });
  }
  if (!order) return NextResponse.json({ error: "Failed to create order" }, { status: 500 });

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

  const { data: product } = await supabase.from("products").select("name").eq("id", productId).single();
  const productName = product?.name || "your order";
  if (seller?.email) {
    const t = emailTemplates().orderPlaced(seller.username || "seller", productName, finalAmount);
    sendEmail({ to: seller.email, subject: t.subject, html: t.html }).catch(() => {});
  }
  if (buyerEmail) {
    const t = { subject: `Order placed — ${productName}`, html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Order placed</h2><p>Hi ${buyerName}, your order for <b>${productName}</b> — ₦${finalAmount.toLocaleString()} is pending. Transfer to ${seller.bank_name} ${seller.account_number} (${seller.account_name}) then tap "I've sent the money".</p></div>` };
    sendEmail({ to: buyerEmail, subject: t.subject, html: t.html }).catch(() => {});
  }

  return NextResponse.json({
    orderId: order.id,
    bankName: seller.bank_name,
    accountNumber: seller.account_number,
    accountName: seller.account_name,
    reference,
  });
}
