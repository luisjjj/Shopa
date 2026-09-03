import { createHmac, timingSafeEqual } from "crypto";
import { findOrderByReference, markOrderPaid } from "@/lib/orders";
import { NextResponse } from "next/server";

// Paystack webhook — SOURCE OF TRUTH for purchase paid state.
// Configure URL in Paystack dashboard: Settings → API Keys & Webhooks →
// Webhook URL: https://myshopa.com.ng/api/webhooks/paystack
// The client callback (/api/payments/callback) is UX only; whichever arrives
// first settles the order, the other is a no-op (see markOrderPaid).
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const rawBody = await request.text();

  const signature = request.headers.get("x-paystack-signature") || "";
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");

  let valid = false;
  try {
    valid =
      signature.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    valid = false;
  }

  if (!secret || !valid) {
    console.error("[webhook/paystack] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const data = event.data || {};
  const meta = (data.metadata || {}) as { type?: string; orderId?: string };
  const reference = data.reference as string | undefined;

  // Only settle Shopa product purchases here — subscription charges are
  // handled by /api/upgrade/verify and must never touch orders.
  if (meta.type && meta.type !== "purchase") {
    return NextResponse.json({ ok: true, ignored: "non-purchase" });
  }

  let orderId = meta.orderId;
  if (!orderId && reference) {
    orderId = (await findOrderByReference(reference))?.id;
  }
  if (!orderId) {
    console.error("[webhook/paystack] charge.success with no matching order", reference);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const settled = await markOrderPaid(orderId, "webhook");
  if (!settled.ok) {
    return NextResponse.json({ error: settled.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, alreadySettled: settled.alreadySettled });
}
