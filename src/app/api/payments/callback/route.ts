import { verifyTransaction } from "@/lib/paystack";
import { findOrderByReference, markOrderPaid, settleCart } from "@/lib/orders";
import { getAppBaseUrl } from "@/lib/security";
import { computeBuyerTotal } from "@/lib/platform";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

// Client-side redirect landing after Paystack checkout. This is UX only.
// The webhook (/api/webhooks/paystack) is the source of truth for paid state,
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
      const metaIds = Array.isArray(meta.orderIds)
        ? meta.orderIds.filter((v: unknown): v is string => typeof v === "string")
        : [];
      const orderId: string | undefined = metaIds[0] || meta.orderId;
      const target = orderId
        ? orderId
        : (await findOrderByReference(reference))?.id;

      // Multi-line cart charge: settle every line, one consolidated email,
      // then land on a cart receipt.
      if (metaIds.length > 1 && target) {
        const cart = await settleCart(metaIds, "callback");
        if (cart.ok) {
          const params = new URLSearchParams({
            status: "success",
            paid: "1",
            cart: "1",
            count: String(cart.count),
            orderId: cart.firstOrderId,
            reference: cart.reference || reference,
            amount: String(cart.total),
            product: `${cart.count} items${cart.storeUsername ? ` from ${cart.storeUsername}` : ""}`,
            buyer: cart.buyerName,
          });
          return NextResponse.redirect(`${origin}/confirm?${params.toString()}`);
        }
      }

      if (target) {
        const settled = await markOrderPaid(target, "callback");
        if (settled.ok) {
          // Look up display details so the receipt shows the full breakdown.
          // amount = TOTAL charged (product + fees); productPrice = seller revenue.
          let amount = "";
          let product = "";
          let buyer = "";
          let productPrice = "";
          let shopaFee = "";
          let paystackFee = "";
          try {
            const svc = createServiceRoleClient();
            const { data: order } = (await svc
              .from("orders")
              .select("amount, buyer_name, product_id")
              .eq("id", target)
              .single()) as unknown as {
              data: { amount: number; buyer_name: string | null; product_id: string } | null;
            };
            if (order) {
              const b = computeBuyerTotal(order.amount);
              amount = String(b.total);
              productPrice = String(b.product);
              shopaFee = String(b.shopaFee);
              paystackFee = String(b.paystackFee);
              buyer = order.buyer_name || "";
              const { data: prod } = (await svc
                .from("products")
                .select("name")
                .eq("id", order.product_id)
                .single()) as unknown as { data: { name: string } | null };
              if (prod) product = prod.name;
            }
          } catch (e) {
            console.error("[payments/callback] receipt lookup failed", e);
          }
          const params = new URLSearchParams({
            status: "success",
            paid: "1",
            orderId: target,
            reference,
            amount,
            product,
            buyer,
            productPrice,
            shopaFee,
            paystackFee,
          });
          return NextResponse.redirect(`${origin}/confirm?${params.toString()}`);
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
