"use client";

export type CartLine = { productId: string; variantId: string | null; qty: number };

export const CART_EVENT = "shopa-cart-updated";

const mem = new Map<string, CartLine[]>();

function key(sellerId: string): string {
  return `shopa-cart:${sellerId}`;
}

function snapshot(lines: CartLine[]): CartLine[] {
  return lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty }));
}

export function loadCart(sellerId: string): CartLine[] {
  try {
    const raw = localStorage.getItem(key(sellerId));
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    if (!Array.isArray(parsed)) return snapshot(mem.get(sellerId) ?? []);
    const cleaned = parsed.filter(
      (l) =>
        l &&
        typeof l.productId === "string" &&
        (l.variantId === null || typeof l.variantId === "string") &&
        Number.isInteger(l.qty) &&
        l.qty > 0 &&
        l.qty <= 99
    );
    mem.set(sellerId, snapshot(cleaned));
    return snapshot(cleaned);
  } catch {
    return snapshot(mem.get(sellerId) ?? []);
  }
}

function save(sellerId: string, lines: CartLine[]) {
  const next = snapshot(lines);
  mem.set(sellerId, snapshot(next));
  try {
    if (next.length === 0) localStorage.removeItem(key(sellerId));
    else localStorage.setItem(key(sellerId), JSON.stringify(next));
  } catch {
    mem.set(sellerId, snapshot(next));
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
