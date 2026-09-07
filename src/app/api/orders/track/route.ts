import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";
import { logAuthEvent } from "@/lib/auth-log";
import { normalizePhone } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const limited = rateLimit(request, "track", 20, 10 * 60 * 1000);
  if (!limited.ok) {
    await logAuthEvent("track_abuse", "rate-limited");
    return NextResponse.json(
      { error: "Too many lookups. Try again in a few minutes" },
      { status: 429 }
    );
  }

  const { reference, contact } = await request.json().catch(() => ({}));
  const ref = String(reference || "").trim().slice(0, 120);
  const rawContact = String(contact || "").trim().toLowerCase().slice(0, 120);
  if (!ref || !rawContact) {
    return NextResponse.json(
      { error: "Order reference and phone or email required" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  const { data: order } = (await supabase
    .from("orders")
    .select(
      "id, buyer_name, buyer_phone, amount, paid, fulfilled, confirmed_by_buyer, created_at, paystack_reference, product_id, seller_id"
    )
    .eq("paystack_reference", ref)
    .maybeSingle()) as unknown as {
    data: {
      id: string;
      buyer_name: string | null;
      buyer_phone: string;
      amount: number;
      paid: boolean;
      fulfilled: boolean;
      confirmed_by_buyer: boolean;
      created_at: string;
      paystack_reference: string;
      product_id: string;
      seller_id: string;
    } | null;
  };

  // Same generic response whether the ref is unknown or the contact
  // doesn't match, so refs can't be enumerated.
  const notFound = () =>
    NextResponse.json(
      { error: "No order found for those details. Check the reference and phone/email used at checkout" },
      { status: 404 }
    );
  if (!order) return notFound();

  let buyerEmail: string | null = null;
  try {
    const { data } = (await supabase
      .from("orders")
      .select("buyer_email")
      .eq("id", order.id)
      .single()) as unknown as { data: { buyer_email: string | null } | null };
    buyerEmail = data?.buyer_email || null;
  } catch {
    buyerEmail = null;
  }

  const phoneDigits = normalizePhone(rawContact);
  const orderPhoneDigits = normalizePhone(order.buyer_phone || "");
  const emailMatch =
    buyerEmail && rawContact.includes("@") && buyerEmail.toLowerCase() === rawContact;
  const phoneMatch =
    phoneDigits && orderPhoneDigits && phoneDigits === orderPhoneDigits;
  if (!emailMatch && !phoneMatch) return notFound();

  const [{ data: product }, { data: seller }] = await Promise.all([
    supabase.from("products").select("name").eq("id", order.product_id).single(),
    supabase.from("users").select("username").eq("id", order.seller_id).single(),
  ]);

  const productName = (product as { name?: string } | null)?.name || "your order";
  const storeUsername = (seller as { username?: string } | null)?.username || null;
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng").replace(/\/$/, "");

  return NextResponse.json({
    reference: order.paystack_reference,
    productName,
    amount: order.amount,
    paid: order.paid,
    fulfilled: order.fulfilled,
    createdAt: order.created_at,
    storeUsername,
    storeUrl: storeUsername ? `${base}/${storeUsername}` : null,
  });
}
