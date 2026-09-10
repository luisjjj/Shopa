import { computeBuyerTotal, MIN_ORDER_NAIRA } from "@/lib/platform";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CartInputLine = { productId: string; variantId?: string | null; qty?: number };

export type QuotedLine = {
  productId: string;
  variantId: string | null;
  variantName: string | null;
  productName: string;
  image_url: string | null;
  unitPrice: number;
  qty: number;
  lineProduct: number;
  lineShopa: number;
  linePaystack: number;
  lineTotal: number;
};

export type CartQuote = {
  sellerId: string;
  username: string;
  lines: QuotedLine[];
  count: number;
  productSum: number;
  shopaSum: number;
  paystackSum: number;
  total: number;
};

// Validates raw cart lines against live catalog data and prices every unit.
// Unit prices always come from the DB, never from the client. Throws a
// user-safe Error on any problem.
export async function quoteCart(
  supabase: SupabaseClient,
  sellerId: string,
  items: CartInputLine[]
): Promise<CartQuote> {
  if (!sellerId || typeof sellerId !== "string") throw new Error("Invalid store");
  if (!Array.isArray(items) || items.length === 0) throw new Error("Your cart is empty");
  if (items.length > 50) throw new Error("Too many different items. Checkout in batches");

  const { data: seller } = (await supabase
    .from("users")
    .select("username, paystack_subaccount_code")
    .eq("id", sellerId)
    .single()) as unknown as {
    data: { username: string; paystack_subaccount_code: string | null } | null;
  };
  if (!seller?.paystack_subaccount_code) {
    const e = new Error("This seller hasn't set up payouts yet") as Error & { code?: string };
    e.code = "SELLER_PAYOUT_NOT_SETUP";
    throw e;
  }

  const lines: QuotedLine[] = [];
  for (const raw of items) {
    const productId = typeof raw?.productId === "string" ? raw.productId : "";
    const variantId = typeof raw?.variantId === "string" && raw.variantId ? raw.variantId : null;
    const qty = Number.isInteger(raw?.qty) ? Math.max(1, Math.min(99, raw.qty as number)) : 1;
    if (!productId) throw new Error("Invalid cart item");

    const { data: product } = (await supabase
      .from("products")
      .select("id, name, price, image_url, stock, is_active, has_variants, user_id")
      .eq("id", productId)
      .single()) as unknown as {
      data: {
        id: string;
        name: string;
        price: number;
        image_url: string | null;
        stock: number | null;
        is_active: boolean;
        has_variants: boolean;
        user_id: string;
      } | null;
    };
    if (!product || !product.is_active || product.user_id !== sellerId) {
      throw new Error("A product in your cart is no longer available");
    }

    let unitPrice = product.price;
    let variantName: string | null = null;
    if (product.has_variants) {
      if (!variantId) throw new Error(`Choose an option for ${product.name}`);
      const { data: variant } = (await supabase
        .from("product_variants")
        .select("name, stock, price_override, is_active")
        .eq("id", variantId)
        .eq("product_id", productId)
        .single()) as unknown as {
        data: { name: string; stock: number | null; price_override: number | null; is_active: boolean } | null;
      };
      if (!variant || !variant.is_active) {
        throw new Error(`An option for ${product.name} is no longer available`);
      }
      if (variant.stock != null && variant.stock < qty) {
        throw new Error(`Only ${variant.stock} left of ${product.name} (${variant.name})`);
      }
      variantName = variant.name;
      if (variant.price_override != null) unitPrice = variant.price_override;
    } else {
      if (variantId) throw new Error("Invalid cart item");
      if (product.stock != null && product.stock < qty) {
        throw new Error(`Only ${product.stock} left of ${product.name}`);
      }
    }
    if (!Number.isInteger(unitPrice) || unitPrice < 1) {
      throw new Error("A product in your cart is no longer available");
    }

    const unit = computeBuyerTotal(unitPrice);
    lines.push({
      productId,
      variantId,
      variantName,
      productName: product.name,
      image_url: product.image_url,
      unitPrice,
      qty,
      lineProduct: unit.product * qty,
      lineShopa: unit.shopaFee * qty,
      linePaystack: unit.paystackFee * qty,
      lineTotal: unit.total * qty,
    });
  }

  const productSum = lines.reduce((n, l) => n + l.lineProduct, 0);
  const shopaSum = lines.reduce((n, l) => n + l.lineShopa, 0);
  const paystackSum = lines.reduce((n, l) => n + l.linePaystack, 0);
  const total = lines.reduce((n, l) => n + l.lineTotal, 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  if (total < MIN_ORDER_NAIRA) {
    throw new Error(`Cart total (₦${total.toLocaleString()}) is below the ₦${MIN_ORDER_NAIRA} minimum`);
  }

  return { sellerId, username: seller.username, lines, count, productSum, shopaSum, paystackSum, total };
}
