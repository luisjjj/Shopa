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
  const { data: updated } = await supabase.from("orders").update({ paid: true }).eq("id", orderId).eq("seller_id", user.id).select("buyer_email, buyer_name, amount, product_id").single();
  if (updated) {
    const service = createServiceRoleClient();
    const { data: product } = await service.from("products").select("name").eq("id", updated.product_id).single();
    const buyerEmail = (updated as unknown as { buyer_email?: string }).buyer_email;
    if (buyerEmail) {
      const t = emailTemplates().orderConfirmed(product?.name || "your order", updated.amount);
      sendEmail({ to: buyerEmail, subject: t.subject, html: t.html }).catch(() => {});
    }
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
