import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  let orderId = formData?.get("order_id") as string | null;
  if (!orderId) {
    const body = await request.json().catch(() => ({}));
    orderId = body.orderId || body.order_id;
  }
  if (!orderId) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: order } = await supabase.from("orders").select("id, seller_id, buyer_name, buyer_phone, amount, paid, products(name)").eq("id", orderId).eq("seller_id", user.id).single();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if ((order as unknown as { paid: boolean }).paid) {
    if (formData) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.json({ error: "Order already confirmed as paid" }, { status: 400 });
  }

  await supabase.from("orders").update({ confirmed_by_buyer: false, paid: false }).eq("id", orderId);

  const productName = (order.products as unknown as { name: string } | null)?.name || "your order";
  const buyerPhone = order.buyer_phone || "";
  const cleanPhone = buyerPhone.replace("+", "").replace(/\s/g, "");
  const whatsappText = encodeURIComponent(`Hi ${order.buyer_name || ""}, your payment of ₦${order.amount?.toLocaleString()} for "${productName}" was not confirmed by the seller. Please double-check the transfer or contact support.`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappText}` : null;

  const buyerEmail = (order as unknown as { buyer_email?: string }).buyer_email;
  if (buyerEmail) {
    const t = emailTemplates().orderNotReceived(productName, order.amount);
    await sendEmail({ to: buyerEmail, subject: t.subject, html: t.html });
  } else {
    console.log(`[not-received] no buyer email — would notify ${order.buyer_name} <${buyerPhone}> amount ₦${order.amount} product "${productName}"`);
  }

  if (formData) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.json({ ok: true, whatsappUrl, message: "Buyer notified via WhatsApp and email (SMTP when configured)" });
}
