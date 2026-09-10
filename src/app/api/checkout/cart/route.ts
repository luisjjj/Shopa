import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { quoteCart } from "@/lib/cart-server";

// Creates one order row per cart UNIT (qty 3 = 3 rows). Per-unit rows keep
// settlement, stock, and seller payouts exact; all rows share one Paystack
// reference so a single charge settles the whole cart.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { sellerId, items, buyerName, buyerPhone, buyerEmail } = body;

  if (!buyerName || typeof buyerName !== "string" || !buyerName.trim()) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }
  if (!buyerPhone || typeof buyerPhone !== "string" || !buyerPhone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }
  if (!buyerEmail || !String(buyerEmail).includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const normalizedEmail = String(buyerEmail).trim().toLowerCase();
  const cleanName = String(buyerName).trim().slice(0, 120);
  const cleanPhone = String(buyerPhone).trim().slice(0, 40);

  const supabase = createServiceRoleClient();
  let quote;
  try {
    quote = await quoteCart(supabase, sellerId, items);
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code === "SELLER_PAYOUT_NOT_SETUP") {
      return NextResponse.json(
        { error: "SELLER_PAYOUT_NOT_SETUP", message: err.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: err.message || "Could not create order" }, { status: 400 });
  }

  const reference = `shopa_cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const rows: Record<string, unknown>[] = [];
  for (const line of quote.lines) {
    for (let i = 0; i < line.qty; i++) {
      rows.push({
        product_id: line.productId,
        seller_id: sellerId,
        buyer_name: cleanName,
        buyer_phone: cleanPhone,
        buyer_email: normalizedEmail,
        amount: line.unitPrice,
        paystack_reference: reference,
        paid: false,
        confirmed_by_buyer: false,
        promo_code_id: null,
        variant_id: line.variantId,
      });
    }
  }

  // buyer_email column may not exist yet (migration pending): retry
  // without it so checkout never breaks on schema lag.
  let inserted: { id: string }[] | null = null;
  const res = (await supabase.from("orders").insert(rows).select("id")) as unknown as {
    data: { id: string }[] | null;
    error: { message: string } | null;
  };
  if (res.error && String(res.error.message).includes("buyer_email")) {
    const slim = rows.map((r) => {
      const copy = { ...(r as Record<string, unknown>) };
      delete copy.buyer_email;
      return copy;
    });
    const r2 = (await supabase.from("orders").insert(slim).select("id")) as unknown as {
      data: { id: string }[] | null;
      error: { message: string } | null;
    };
    if (r2.error) {
      return NextResponse.json({ error: "Could not create order. Try again" }, { status: 500 });
    }
    inserted = r2.data;
  } else if (res.error) {
    return NextResponse.json({ error: "Could not create order. Try again" }, { status: 500 });
  } else {
    inserted = res.data;
  }

  if (!inserted || inserted.length === 0) {
    return NextResponse.json({ error: "Could not create order. Try again" }, { status: 500 });
  }

  return NextResponse.json({
    orderIds: inserted.map((o) => o.id),
    reference,
    total: quote.total,
    count: quote.count,
    username: quote.username,
  });
}
