import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail, emailTemplates } from "@/lib/email";
import { computeBuyerTotal } from "@/lib/platform";
import { buildWaLink, normalizePhone, sellerPaidAlertText, sendSellerWhatsAppAlert } from "@/lib/whatsapp";

export type SettleResult =
  | { ok: true; alreadySettled: boolean; orderId: string }
  | { ok: false; error: string };

type OrderRow = {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_name: string | null;
  buyer_email?: string | null;
  amount: number;
  promo_code_id: string | null;
  variant_id: string | null;
  paid: boolean;
};

// Single source of truth for marking a product purchase as paid.
// Called by the Paystack webhook AND the client callback, whichever gets
// there first wins; the loser is a no-op (guarded by paid=false).
// NOTE on refunds: Paystack pulls refunds from OUR main balance, not from the
// seller's settled share. A future refund feature needs manual reconciliation.
export async function markOrderPaid(orderId: string, source: "webhook" | "callback"): Promise<SettleResult> {
  const supabase = createServiceRoleClient();

  const { data: order, error } = (await supabase
    .from("orders")
    .update({ paid: true, confirmed_by_buyer: true })
    .eq("id", orderId)
    .eq("paid", false)
    .select("id, product_id, seller_id, buyer_name, amount, promo_code_id, variant_id, paid")
    .single()) as unknown as { data: Omit<OrderRow, "buyer_email"> | null; error: { message: string } | null };

  if (error || !order) {
    const { data: existing } = (await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .maybeSingle()) as unknown as { data: { id: string } | null };
    if (existing) return { ok: true, alreadySettled: true, orderId };
    console.error(`[orders] markOrderPaid(${source}) failed:`, error);
    return { ok: false, error: error?.message || "Order not found" };
  }

  // buyer contact + reference fields may lag behind schema, fetch
  // defensively so settling never breaks; receipts just skip gaps.
  let buyerEmail: string | null = null;
  let buyerPhone: string | null = null;
  let reference: string | null = null;
  let placedAt: string | null = null;
  let deliveryAddress: string | null = null;
  try {
    const { data: detailRow } = (await supabase
      .from("orders")
      .select("buyer_email, buyer_phone, paystack_reference, created_at, delivery_address")
      .eq("id", orderId)
      .single()) as unknown as {
      data: {
        buyer_email: string | null;
        buyer_phone: string | null;
        paystack_reference: string | null;
        created_at: string | null;
        delivery_address: string | null;
      } | null;
    };
    buyerEmail = detailRow?.buyer_email || null;
    buyerPhone = detailRow?.buyer_phone || null;
    reference = detailRow?.paystack_reference || null;
    placedAt = detailRow?.created_at || null;
    deliveryAddress = detailRow?.delivery_address || null;
  } catch {
    buyerEmail = null;
  }

  const { data: product } = await supabase
    .from("products")
    .select("name, stock")
    .eq("id", order.product_id)
    .single();

  let variantName: string | null = null;
  if (order.variant_id) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("name, stock")
      .eq("id", order.variant_id)
      .single();
    variantName = variant?.name || null;
    if (variant && variant.stock != null && variant.stock > 0) {
      await supabase
        .from("product_variants")
        .update({ stock: variant.stock - 1 })
        .eq("id", order.variant_id);
    }
  } else if (product && product.stock != null && product.stock > 0) {
    await supabase.from("products").update({ stock: product.stock - 1 }).eq("id", order.product_id);
  }

  if (order.promo_code_id) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("used_count")
      .eq("id", order.promo_code_id)
      .single();
    if (promo) {
      await supabase
        .from("promo_codes")
        .update({ used_count: promo.used_count + 1 })
        .eq("id", order.promo_code_id);
    }
  }

  const productName = product?.name || "your order";

  const { data: seller } = await supabase
    .from("users")
    .select("email, username, whatsapp_number")
    .eq("id", order.seller_id)
    .single();

  // Instant seller alert: WhatsApp Cloud API if configured, plus a loud
  // email that carries a one-tap WhatsApp self-ping link as fallback.
  // Best-effort only, settling the order must never depend on it.
  const sellerNumber = (seller as { whatsapp_number?: string | null } | null)?.whatsapp_number || null;
  if (sellerNumber && normalizePhone(sellerNumber)) {
    const alertText = sellerPaidAlertText({
      buyerName: order.buyer_name || "A buyer",
      productName,
      amount: order.amount,
      reference: orderId.slice(0, 8),
    });
    sendSellerWhatsAppAlert(sellerNumber, alertText)
      .then((sent) => {
        if (sent) console.log(`[orders] whatsapp alert sent for ${orderId}`);
      })
      .catch((e) => console.error("[orders] whatsapp alert failed", e));
    try {
      const webPush = (await import("web-push")).default;
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webPush.setVapidDetails(
          "mailto:hello@myshopa.com.ng",
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth")
          .eq("user_id", order.seller_id);
        const payload = JSON.stringify({
          title: `New paid order: ${productName}`,
          body: `${order.buyer_name || "A buyer"} paid ₦${order.amount.toLocaleString()}. Fulfill it now.`,
          url: "/dashboard",
        });
        for (const sub of (subs as { endpoint: string; p256dh: string; auth: string }[] | null) || []) {
          try {
            await webPush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
          } catch {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      }
    } catch (e) {
      console.error("[orders] seller push failed", e);
    }
  }

  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng").replace(/\/$/, "");
  const sellerUsername = (seller as { username?: string | null } | null)?.username || null;
  const buyerName = order.buyer_name || "A buyer";
  const ref = reference || orderId.slice(0, 8);
  const dateStr = placedAt
    ? new Date(placedAt).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : new Date().toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  if (seller?.email) {
    const waLink =
      sellerNumber && normalizePhone(sellerNumber)
        ? buildWaLink(
            sellerNumber,
            sellerPaidAlertText({ buyerName, productName, amount: order.amount, reference: ref })
          )
        : null;
    const t = emailTemplates().orderPaidSeller({
      buyerName,
      buyerPhone,
      productName,
      variantName,
      storeName: sellerUsername || "your store",
      storeUrl: sellerUsername ? `${base}/${sellerUsername}` : `${base}/dashboard`,
      trackUrl: `${base}/track`,
      dashboardUrl: `${base}/dashboard`,
      waForwardUrl: waLink,
      deliveryAddress,
      reference: ref,
      date: dateStr,
      price: order.amount,
      total: order.amount,
    });
    sendEmail({ to: seller.email, subject: t.subject, html: t.html }).catch((e) =>
      console.error("[orders] seller paid email failed", e)
    );
  }

  if (buyerEmail) {
    const b = computeBuyerTotal(order.amount);
    const t = emailTemplates().orderReceiptBuyer({
      buyerName,
      productName,
      variantName,
      storeName: sellerUsername || "your store",
      storeUrl: sellerUsername ? `${base}/${sellerUsername}` : base,
      trackUrl: `${base}/track`,
      dashboardUrl: `${base}/dashboard`,
      reference: ref,
      date: dateStr,
      price: b.product,
      shopaFee: b.shopaFee,
      paystackFee: b.paystackFee,
      total: b.total,
    });
    sendEmail({ to: buyerEmail, subject: t.subject, html: t.html }).catch((e) =>
      console.error("[orders] buyer receipt email failed", e)
    );
  }

  console.log(`[orders] order ${orderId} marked paid via ${source}`);
  return { ok: true, alreadySettled: false, orderId };
}

export async function findOrderByReference(reference: string) {
  const supabase = createServiceRoleClient();
  const { data } = (await supabase
    .from("orders")
    .select("id")
    .eq("paystack_reference", reference)
    .maybeSingle()) as unknown as { data: { id: string } | null };
  return data;
}
