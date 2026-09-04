import { verifyTransaction } from "@/lib/paystack";
import { findOrderByReference, markOrderPaid } from "@/lib/orders";
import { getAppBaseUrl } from "@/lib/security";
import { NextResponse } from "next/server";

// Client-side redirect landing after Paystack checkout. This is UX only —
// the webhook (/api/webhooks/paystack) is the source of truth for paid state,
// so this handler re-verifies server-side and both paths are idempotent.
// Redirects use the allowlisted base URL, never the request Host.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getAppBaseUrl();
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(`${origin}/confirm?status=error&message=Missing+reference`);
  }

  try {
    const result = await verifyTransaction(reference);
    const meta = result?.data?.metadata || {};

    if (result.status && result.data?.status === "success" && meta.type === "purchase") {
      const orderId: string | undefined = meta.orderId;
      const target = orderId
        ? orderId
        : (await findOrderByReference(reference))?.id;

      if (target) {
        const settled = await markOrderPaid(target, "callback");
        if (settled.ok) {
          return NextResponse.redirect(
            `${origin}/confirm?status=success&paid=1&orderId=${target}&reference=${reference}`
          );
        }
      }
    }
  } catch (e) {
    console.error("[payments/callback] verify failed", e);
  }

  return NextResponse.redirect(
    `${origin}/confirm?status=error&message=Payment+not+confirmed+yet`
  );
}
