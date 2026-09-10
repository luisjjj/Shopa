"use client";

export type CartLine = { productId: string; variantId: string | null; qty: number };

export const CART_EVENT = "shopa-cart-updated";

function key(sellerId: string): string {
  return `shopa-cart:${sellerId}`;
}

export function loadCart(sellerId: string): CartLine[] {
  try {
    const raw = localStorage.getItem(key(sellerId));
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) =>
        l &&
        typeof l.productId === "string" &&
        (l.variantId === null || typeof l.variantId === "string") &&
        Number.isInteger(l.qty) &&
        l.qty > 0 &&
        l.qty <= 99
    );
  } catch {
    return [];
  }
}

function save(sellerId: string, lines: CartLine[]) {
  try {
    if (lines.length === 0) localStorage.removeItem(key(sellerId));
    else localStorage.setItem(key(sellerId), JSON.stringify(lines));
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { sellerId } }));
}

export function addToCart(sellerId: string, productId: string, variantId: string | null, qty = 1) {
  const lines = loadCart(sellerId);
  const found = lines.find((l) => l.productId === productId && (l.variantId || null) === (variantId || null));
  if (found) found.qty = Math.min(99, found.qty + qty);
  else lines.push({ productId, variantId: variantId || null, qty: Math.max(1, Math.min(99, qty)) });
  save(sellerId, lines);
}

export function setLineQty(sellerId: string, productId: string, variantId: string | null, qty: number) {
  let lines = loadCart(sellerId);
  if (qty <= 0) {
    lines = lines.filter(
      (l) => !(l.productId === productId && (l.variantId || null) === (variantId || null))
    );
  } else {
    const found = lines.find(
      (l) => l.productId === productId && (l.variantId || null) === (variantId || null)
    );
    if (found) found.qty = Math.min(99, qty);
  }
  save(sellerId, lines);
}

export function clearCart(sellerId: string) {
  save(sellerId, []);
}

export function cartCount(sellerId: string): number {
  return loadCart(sellerId).reduce((n, l) => n + l.qty, 0);
}
