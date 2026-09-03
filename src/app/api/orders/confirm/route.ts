import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { error, data } = await supabase
    .from("orders")
    .update({ confirmed_by_buyer: true })
    .eq("id", orderId)
    .eq("paid", false)
    .select("seller_id, buyer_name, amount, product_id, buyer_email")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data) {
    const { data: seller } = await supabase.from("users").select("email, username").eq("id", data.seller_id).single();
    const { data: product } = await supabase.from("products").select("name").eq("id", data.product_id).single();
    const productName = product?.name || "order";
    if (seller?.email) {
      const t = emailTemplates().orderAwaiting(data.buyer_name || "Buyer", productName, data.amount);
      sendEmail({ to: seller.email, subject: t.subject, html: t.html }).catch(() => {});
    }
    const buyerEmail = (data as unknown as { buyer_email?: string }).buyer_email;
    if (buyerEmail) {
      const t = { subject: `Awaiting seller confirmation — ${productName}`, html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><p>Hi ${data.buyer_name}, your payment claim for <b>${productName}</b> — ₦${data.amount.toLocaleString()} is awaiting seller confirmation.</p></div>` };
      sendEmail({ to: buyerEmail, subject: t.subject, html: t.html }).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
