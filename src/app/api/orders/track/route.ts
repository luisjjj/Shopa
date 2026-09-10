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
  const { data: orders } = (await supabase
    .from("orders")
    .select("id, buyer_name, buyer_phone, amount, paid, fulfilled, created_at, paystack_reference, product_id, variant_id, seller_id")
    .eq("paystack_reference", ref)
    .order("created_at", { ascending: true })) as unknown as {
    data: {
      id: string;
      buyer_name: string | null;
      buyer_phone: string;
      amount: number;
      paid: boolean;
      fulfilled: boolean;
      created_at: string;
      paystack_reference: string;
      product_id: string;
      variant_id: string | null;
      seller_id: string;
    }[] | null;
  };

  // Same generic response whether the ref is unknown or the contact
  // doesn't match, so refs can't be enumerated.
  const notFound = () =>
    NextResponse.json(
      { error: "No order found for those details. Check the reference and phone/email used at checkout" },
      { status: 404 }
    );
  if (!orders || orders.length === 0) return notFound();

  const first = orders[0];
  let buyerEmail: string | null = null;
  try {
    const { data } = (await supabase
      .from("orders")
      .select("buyer_email")
      .eq("id", first.id)
      .single()) as unknown as { data: { buyer_email: string | null } | null };
    buyerEmail = data?.buyer_email || null;
  } catch {
    buyerEmail = null;
  }

  const phoneDigits = normalizePhone(rawContact);
  const orderPhoneDigits = normalizePhone(first.buyer_phone || "");
  const emailMatch =
    buyerEmail && rawContact.includes("@") && buyerEmail.toLowerCase() === rawContact;
  const phoneMatch =
    phoneDigits && orderPhoneDigits && phoneDigits === orderPhoneDigits;
  if (!emailMatch && !phoneMatch) return notFound();

  const productIds = Array.from(new Set(orders.map((o) => o.product_id)));
  const variantIds = Array.from(new Set(orders.map((o) => o.variant_id).filter((v): v is string => !!v)));
  const [{ data: products }, { data: variants }, { data: seller }] = await Promise.all([
    supabase.from("products").select("id, name").in("id", productIds),
    variantIds.length > 0
      ? supabase.from("product_variants").select("id, name").in("id", variantIds)
      : Promise.resolve({ data: [] }),
    supabase.from("users").select("username").eq("id", first.seller_id).single(),
  ]);
  const productNames = new Map(((products as { id: string; name: string }[] | null) || []).map((p) => [p.id, p.name]));
  const variantNames = new Map((((variants as { id: string; name: string }[] | null) || [])).map((v) => [v.id, v.name]));

  const storeUsername = (seller as { username?: string } | null)?.username || null;
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng").replace(/\/$/, "");

  return NextResponse.json({
    reference: first.paystack_reference,
    count: orders.length,
    buyerName: first.buyer_name,
    createdAt: first.created_at,
    storeUsername,
    storeUrl: storeUsername ? `${base}/${storeUsername}` : null,
    lines: orders.map((o) => ({
      id: o.id,
      productName: productNames.get(o.product_id) || "Item",
      variantName: o.variant_id ? variantNames.get(o.variant_id) || null : null,
      amount: o.amount,
      paid: o.paid,
      fulfilled: o.fulfilled,
    })),
  });
}
