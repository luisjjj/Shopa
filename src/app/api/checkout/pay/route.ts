import { createServiceRoleClient } from "@/lib/supabase/service";
import { initializeSplitTransaction } from "@/lib/paystack";
import { computeBuyerTotal, isStarterSafeError, MIN_ORDER_KOBO, MIN_ORDER_NAIRA, nairaToKobo } from "@/lib/platform";
import { getAppBaseUrl } from "@/lib/security";
import { NextResponse } from "next/server";

type PayOrder = {
  id: string;
  amount: number;
  paid: boolean;
  paystack_reference: string;
  seller_id: string;
};

// Accepts a single orderId (buy-now) or orderIds[] (cart). Cart lines share
// one Paystack reference, so one split charge settles the whole cart while
// each order row keeps its own per-product settlement downstream.
export async function POST(request: Request) {
  const { orderId, orderIds } = await request.json().catch(() => ({}));
  const ids = (
    Array.isArray(orderIds) ? orderIds : orderId ? [orderId] : []
  ).filter((v): v is string => typeof v === "string" && v.length > 0);

  if (ids.length === 0) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  if (ids.length > 100) {
    return NextResponse.json({ error: "Too many items. Checkout in batches" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: orders, error: orderError } = (await supabase
    .from("orders")
    .select("id, amount, paid, paystack_reference, seller_id")
    .in("id", ids)) as unknown as { data: PayOrder[] | null; error: { message: string } | null };

  if (orderError || !orders || orders.length !== ids.length) {
    console.error("[checkout/pay] order lookup failed", orderError);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (orders.some((o) => o.paid)) {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 });
  }
  const sellerId = orders[0].seller_id;
  if (orders.some((o) => o.seller_id !== sellerId)) {
    return NextResponse.json({ error: "Orders span multiple stores" }, { status: 400 });
  }
  const reference = orders[0].paystack_reference;
  if (orders.some((o) => o.paystack_reference !== reference)) {
    return NextResponse.json({ error: "Orders do not belong together" }, { status: 400 });
  }

  // buyer_email column may not exist yet (migration pending), fetch
  // defensively so checkout never breaks on schema lag.
  let buyerEmail: string | null = null;
  try {
    const { data: emailRow } = (await supabase
      .from("orders")
      .select("buyer_email")
      .eq("id", ids[0])
      .single()) as unknown as { data: { buyer_email: string | null } | null };
    buyerEmail = emailRow?.buyer_email || null;
  } catch {
    buyerEmail = null;
  }
  if (!buyerEmail) {
    return NextResponse.json({ error: "Buyer email missing. Restart checkout" }, { status: 400 });
  }

  // Buyer-pays-fees per PRODUCT, summed: each line's Shopa 1% + Paystack
  // estimate is computed on its own unit price, then added up. The seller
  // still nets the full product price on every line.
  let productSum = 0;
  let shopaSum = 0;
  let paystackSum = 0;
  let total = 0;
  for (const o of orders) {
    const b = computeBuyerTotal(o.amount);
    productSum += b.product;
    shopaSum += b.shopaFee;
    paystackSum += b.paystackFee;
    total += b.total;
  }
  const breakdown = { total, product: productSum, shopaFee: shopaSum, paystackFee: paystackSum };
  const amountKobo = nairaToKobo(total);
  const transactionChargeKobo = nairaToKobo(total - productSum);
  if (amountKobo < MIN_ORDER_KOBO) {
    return NextResponse.json(
      { error: `This order (₦${productSum.toLocaleString()}) is below the ₦${MIN_ORDER_NAIRA} Paystack minimum` },
      { status: 400 }
    );
  }

  const { data: seller } = (await supabase
    .from("users")
    .select("paystack_subaccount_code")
    .eq("id", sellerId)
    .single()) as unknown as { data: { paystack_subaccount_code: string | null } | null };

  if (!seller?.paystack_subaccount_code) {
    return NextResponse.json(
      { error: "SELLER_PAYOUT_NOT_SETUP", message: "This seller hasn't set up payouts yet" },
      { status: 400 }
    );
  }

  // Callback target comes from allowlisted config, never the request Host
  // (Host-header poisoning could otherwise mint attacker callbacks).
  const origin = getAppBaseUrl();

  let result;
  try {
    result = await initializeSplitTransaction({
      email: buyerEmail,
      amountKobo,
      subaccount: seller.paystack_subaccount_code,
      transactionChargeKobo,
      bearer: "account", // platform (main account) bears Paystack processing fees
      reference,
      callback_url: `${origin}/api/payments/callback?reference=${reference}`,
      metadata: { type: "purchase", orderIds: ids, orderId: ids[0], sellerId },
    });
  } catch (e) {
    console.error("[checkout/pay] initialize failed", e);
    return NextResponse.json({ error: "Could not start payment. Try again" }, { status: 502 });
  }

  if (!result.status || !result.data?.authorization_url) {
    const message = result.message || "Could not start payment";
    if (isStarterSafeError(message)) {
      console.error("[checkout/pay] POSSIBLE STARTER-BUSINESS RESTRICTION:", message);
    }
    // Self-healing: a definitively invalid subaccount (e.g. test-mode code
    // left over from before the live switch, or deleted in the dashboard)
    // is cleared so the seller is routed back through payout setup instead
    // of every buyer hitting this error forever.
    if (/invalid subaccount/i.test(message)) {
      console.error("[checkout/pay] clearing dead subaccount for seller", sellerId);
      await supabase
        .from("users")
        .update({ paystack_subaccount_code: null, payout_setup_completed_at: null })
        .eq("id", sellerId);
      return NextResponse.json(
        { error: "SELLER_PAYOUT_NOT_SETUP", message: "This seller hasn't set up payouts yet" },
        { status: 400 }
      );
    }
    console.error("[checkout/pay] initialize rejected:", message);
    return NextResponse.json({ error: "Could not start payment. Try again" }, { status: 400 });
  }

  return NextResponse.json({
    authorization_url: result.data.authorization_url,
    reference,
    breakdown,
    count: ids.length,
  });
}
