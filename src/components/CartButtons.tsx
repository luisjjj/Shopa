"use client";

import { useEffect, useState } from "react";
import { CART_EVENT, addToCart, cartCount, loadCart, setLineQty } from "@/lib/cart";

function useCartCount(sellerId: string): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(cartCount(sellerId));
    const update = () => setCount(cartCount(sellerId));
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [sellerId]);
  return count;
}

export function CartNavButton({ sellerId, username, color }: { sellerId: string; username: string; color?: string }) {
  const count = useCartCount(sellerId);
  return (
    <a
      href={`/cart/${username}`}
      className="relative px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:opacity-70 transition-opacity"
      style={color ? { color } : undefined}
      aria-label={`Cart, ${count} items`}
    >
      Cart
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}

export function CartBar({ sellerId, username }: { sellerId: string; username: string }) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setCount(cartCount(sellerId));
    setReady(true);
    const update = () => setCount(cartCount(sellerId));
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [sellerId]);
  if (!ready || count === 0 || loadCart(sellerId).length === 0) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 z-40 sm:max-w-md sm:mx-auto">
      <a
        href={`/cart/${username}`}
        className="flex items-center justify-between gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl px-5 py-3.5 shadow-2xl transition-transform active:scale-[0.98]"
      >
        <span className="text-sm font-semibold">
          Cart · {count} item{count === 1 ? "" : "s"}
        </span>
        <span className="text-sm font-bold text-brand-400 dark:text-brand-600">Checkout →</span>
      </a>
    </div>
  );
}

export function AddButton({ sellerId, productId, name }: { sellerId: string; productId: string; name: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Add ${name} to cart`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(sellerId, productId, null, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-gray-900/80 text-white backdrop-blur flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105"
    >
      {added ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
    </button>
  );
}

export function CardStepper({ sellerId, productId, name }: { sellerId: string; productId: string; name: string }) {
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    const update = () => {
      const found = loadCart(sellerId).find((l) => l.productId === productId && (l.variantId || null) === null);
      setQty(found ? found.qty : 0);
    };
    update();
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [sellerId, productId]);
  if (qty <= 0) {
    return (
      <button
        type="button"
        aria-label={`Add ${name} to cart`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToCart(sellerId, productId, null, 1);
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-gray-900/80 text-white backdrop-blur flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105"
      >
        {added ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        )}
      </button>
    );
  }
  return (
    <div
      className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-gray-900/80 text-white backdrop-blur shadow-lg p-1"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        aria-label={`Remove one ${name} from cart`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLineQty(sellerId, productId, null, qty - 1);
        }}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>
      <span aria-live="polite" className="min-w-[1.25rem] text-center text-sm font-bold leading-none">
        {qty}
      </span>
      <button
        type="button"
        aria-label={`Add one more ${name} to cart`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToCart(sellerId, productId, null, 1);
        }}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
