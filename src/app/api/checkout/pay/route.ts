import { createServiceRoleClient } from "@/lib/supabase/service";
import { initializeSplitTransaction } from "@/lib/paystack";
import { computePlatformFeeKobo, isStarterSafeError, MIN_ORDER_KOBO, MIN_ORDER_NAIRA, nairaToKobo } from "@/lib/platform";
import { getAppBaseUrl } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { orderId } = await request.json().catch(() => ({}));
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: order, error: orderError } = (await supabase
    .from("orders")
    .select("id, amount, paid, paystack_reference, seller_id")
    .eq("id", orderId)
    .single()) as unknown as {
    data: {
      id: string;
      amount: number;
      paid: boolean;
      paystack_reference: string;
      seller_id: string;
    } | null;
    error: { message: string } | null;
  };

  if (orderError || !order) {
    console.error("[checkout/pay] order lookup failed", orderError);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paid) return NextResponse.json({ error: "Order already paid" }, { status: 400 });

  // buyer_email column may not exist yet (migration pending) — fetch
  // defensively so checkout never breaks on schema lag.
  let buyerEmail: string | null = null;
  try {
    const { data: emailRow } = (await supabase
      .from("orders")
      .select("buyer_email")
      .eq("id", orderId)
      .single()) as unknown as { data: { buyer_email: string | null } | null };
    buyerEmail = emailRow?.buyer_email || null;
  } catch {
    buyerEmail = null;
  }
  if (!buyerEmail) {
    return NextResponse.json({ error: "Buyer email missing — restart checkout" }, { status: 400 });
  }

  const amountKobo = nairaToKobo(order.amount);
  if (amountKobo < MIN_ORDER_KOBO) {
    return NextResponse.json(
      { error: `This order (₦${order.amount.toLocaleString()}) is below the ₦${MIN_ORDER_NAIRA} Paystack minimum` },
      { status: 400 }
    );
  }

  const { data: seller } = (await supabase
    .from("users")
    .select("paystack_subaccount_code")
    .eq("id", order.seller_id)
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
  const feeKobo = computePlatformFeeKobo(amountKobo);

  let result;
  try {
    result = await initializeSplitTransaction({
      email: buyerEmail,
      amountKobo,
      subaccount: seller.paystack_subaccount_code,
      transactionChargeKobo: feeKobo,
      bearer: "account", // platform (main account) bears Paystack processing fees
      reference: order.paystack_reference,
      callback_url: `${origin}/api/payments/callback?reference=${order.paystack_reference}`,
      metadata: { type: "purchase", orderId: order.id, sellerId: order.seller_id },
    });
  } catch (e) {
    console.error("[checkout/pay] initialize failed", e);
    return NextResponse.json({ error: "Could not start payment — try again" }, { status: 502 });
  }

  if (!result.status || !result.data?.authorization_url) {
    const message = result.message || "Could not start payment";
    if (isStarterSafeError(message)) {
      console.error("[checkout/pay] POSSIBLE STARTER-BUSINESS RESTRICTION:", message);
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ authorization_url: result.data.authorization_url, reference: order.paystack_reference });
}
