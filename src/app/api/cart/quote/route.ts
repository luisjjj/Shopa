import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { quoteCart } from "@/lib/cart-server";

// Live cart pricing for the cart page. Everything is re-validated at
// order creation, so this is display-only (but still server-priced).
export async function POST(request: Request) {
  const { sellerId, items } = await request.json().catch(() => ({}));
  try {
    const supabase = createServiceRoleClient();
    const quote = await quoteCart(supabase, sellerId, items);
    return NextResponse.json(quote);
  } catch (e) {
    const err = e as Error & { code?: string };
    if (err.code === "SELLER_PAYOUT_NOT_SETUP") {
      return NextResponse.json(
        { error: "SELLER_PAYOUT_NOT_SETUP", message: err.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: err.message || "Could not price cart" }, { status: 400 });
  }
}
