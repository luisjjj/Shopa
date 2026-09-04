import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail, emailTemplates } from "@/lib/email";
import { computeBuyerTotal } from "@/lib/platform";

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
// Called by the Paystack webhook AND the client callback — whichever gets
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

  // buyer_email column may not exist yet (migration pending) — fetch
  // defensively so settling never breaks on schema lag; receipt just skips.
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

  const { data: product } = await supabase
    .from("products")
    .select("name, stock")
    .eq("id", order.product_id)
    .single();

  if (order.variant_id) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", order.variant_id)
      .single();
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
    .select("email, username")
    .eq("id", order.seller_id)
    .single();

  if (seller?.email) {
    const t = {
      subject: `New paid order — ${productName} (₦${order.amount.toLocaleString()})`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>You have a new paid order!</h2><p><b>${order.buyer_name || "A buyer"}</b> just paid <b>₦${order.amount.toLocaleString()}</b> for <b>${productName}</b> via Paystack. The money settles automatically — no action needed except fulfillment.</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng"}/dashboard" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">View order</a></div>`,
    };
    sendEmail({ to: seller.email, subject: t.subject, html: t.html }).catch((e) =>
      console.error("[orders] seller paid email failed", e)
    );
  }

  if (buyerEmail) {
    const b = computeBuyerTotal(order.amount);
    const t = emailTemplates().orderConfirmed(productName, b.total);
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
