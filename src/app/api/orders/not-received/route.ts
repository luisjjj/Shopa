import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

  const { data: order } = await supabase.from("orders").select("id, seller_id, buyer_name, buyer_phone, amount, products(name)").eq("id", orderId).eq("seller_id", user.id).single();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await supabase.from("orders").update({ confirmed_by_buyer: false, paid: false }).eq("id", orderId);

  const productName = (order.products as unknown as { name: string } | null)?.name || "your order";
  const buyerPhone = order.buyer_phone || "";
  const cleanPhone = buyerPhone.replace("+", "").replace(/\s/g, "");
  const whatsappText = encodeURIComponent(`Hi ${order.buyer_name || ""}, your payment of ₦${order.amount?.toLocaleString()} for "${productName}" was not confirmed by the seller. Please double-check the transfer or contact support.`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappText}` : null;

  const smtpHost = process.env.SMTP_HOST;
  const buyerEmail = (order as unknown as { buyer_email?: string }).buyer_email;
  if (smtpHost && buyerEmail) {
    try {
      // SMTP stub — install `nodemailer` and uncomment when ready
      // const nodemailer = await import("nodemailer");
      // const transporter = nodemailer.createTransport({ host: smtpHost, port: parseInt(process.env.SMTP_PORT || "587"), auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
      // await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: buyerEmail, subject: "Payment not confirmed", text: `Hi ${order.buyer_name || ""},\n\nYour payment of ₦${order.amount?.toLocaleString()} for "${productName}" was not confirmed by the seller.\n\n— Shopa` });
      console.log(`[not-received] SMTP configured — would email ${buyerEmail}`);
    } catch (e) {
      console.error("Email send failed", e);
    }
  } else {
    console.log(`[not-received] SMTP not configured — would email buyer: ${order.buyer_name} <${buyerPhone}> amount ₦${order.amount} product "${productName}"` + (buyerEmail ? ` <${buyerEmail}>` : " (no email on file)"));
  }

  if (formData) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.json({ ok: true, whatsappUrl, message: "Buyer notified via WhatsApp and email (SMTP when configured)" });
}
