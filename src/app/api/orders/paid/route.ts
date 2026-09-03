import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orderId = formData.get("order_id") as string;
  if (!orderId) return NextResponse.redirect(new URL("/dashboard", request.url));
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const { data: updated } = await supabase.from("orders").update({ paid: true }).eq("id", orderId).eq("seller_id", user.id).eq("paid", false).select("buyer_email, buyer_name, amount, product_id, variant_id, promo_code_id").single() as never as { data: { buyer_email?: string; buyer_name: string; amount: number; product_id: string; variant_id: string | null; promo_code_id: string | null } | null };
  if (updated) {
    const service = createServiceRoleClient();
    const { data: product } = await service.from("products").select("name").eq("id", updated.product_id).single();
    if (updated.variant_id) {
      const { data: variant } = await service.from("product_variants").select("stock").eq("id", updated.variant_id).single();
      if (variant && variant.stock != null && variant.stock > 0) {
        await service.from("product_variants").update({ stock: variant.stock - 1 }).eq("id", updated.variant_id);
      }
    } else {
      const { data: prod } = await service.from("products").select("stock").eq("id", updated.product_id).single();
      if (prod && prod.stock != null && prod.stock > 0) {
        await service.from("products").update({ stock: prod.stock - 1 }).eq("id", updated.product_id);
      }
    }
    if (updated.promo_code_id) {
      const { data: promo } = await service.from("promo_codes").select("used_count").eq("id", updated.promo_code_id).single();
      if (promo) {
        await service.from("promo_codes").update({ used_count: promo.used_count + 1 }).eq("id", updated.promo_code_id);
      }
    }
    const buyerEmail = updated.buyer_email;
    if (buyerEmail) {
      const t = emailTemplates().orderConfirmed(product?.name || "your order", updated.amount);
      sendEmail({ to: buyerEmail, subject: t.subject, html: t.html }).catch(() => {});
    }
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
