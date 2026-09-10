"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { loadCart, setLineQty, clearCart, type CartLine } from "@/lib/cart";

type QuotedLine = {
  productId: string;
  variantId: string | null;
  variantName: string | null;
  productName: string;
  image_url: string | null;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};

type Quote = {
  lines: QuotedLine[];
  count: number;
  productSum: number;
  shopaSum: number;
  paystackSum: number;
  total: number;
  username: string;
};

export default function CartClient({ sellerId, username }: { sellerId: string; username: string }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [payUrl, setPayUrl] = useState("");
  const [payTotal, setPayTotal] = useState(0);

  const refresh = useCallback(async () => {
    const lines = loadCart(sellerId);
    setItems(lines);
    if (lines.length === 0) {
      setQuote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, items: lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || data.error || "Could not load cart");
        setQuote(null);
      } else {
        setQuote(data as Quote);
      }
    } catch {
      setError("Network error. Try again");
      setQuote(null);
    }
    setLoading(false);
  }, [sellerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changeQty = (line: QuotedLine, delta: number) => {
    setLineQty(sellerId, line.productId, line.variantId, line.qty + delta);
    refresh();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setPayError("");
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          items: loadCart(sellerId),
          buyerName,
          buyerPhone,
          buyerEmail,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.orderIds) {
        setPayError(data.message || data.error || "Could not create order. Try again");
        setPlacing(false);
        return;
      }
      setPaying(true);
      const payRes = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: data.orderIds }),
      });
      const payData = await payRes.json().catch(() => ({}));
      if (!payRes.ok || !payData.authorization_url) {
        setPayError(payData.message || payData.error || "Could not start payment. Try again");
        setPaying(false);
        setPlacing(false);
        return;
      }
      setPayUrl(payData.authorization_url);
      setPayTotal(payData.breakdown?.total ?? quote?.total ?? 0);
      clearCart(sellerId);
    } catch {
      setPayError("Network error. Try again");
      setPaying(false);
    }
    setPlacing(false);
  };

  if (payUrl) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-card dark:shadow-card-dark text-center">
        <p className="text-xs uppercase tracking-wider font-medium text-gray-400">Amount to pay</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          ₦{payTotal.toLocaleString()}
        </p>
        <button
          onClick={() => {
            window.location.href = payUrl;
          }}
          className="btn-primary mt-6"
        >
          Pay ₦{payTotal.toLocaleString()} securely
        </button>
        <p className="text-xs text-gray-400 mt-3">You&apos;ll be redirected to Paystack</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="animate-shimmer h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0 && !quote) {
    return (
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 text-center shadow-card dark:shadow-card-dark">
        <p className="text-gray-900 dark:text-white font-semibold">Your cart is empty</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">Add products from the store to get started</p>
        <Link
          href={`/${username}`}
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {quote?.lines.map((line) => (
          <div
            key={`${line.productId}:${line.variantId || ""}`}
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-xl p-3 shadow-card dark:shadow-card-dark flex items-center gap-3"
          >
            {line.image_url ? (
              <img src={line.image_url} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/[0.05] shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {line.productName}
              </p>
              {line.variantName && (
                <p className="text-xs text-gray-400 truncate">{line.variantName}</p>
              )}
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                ₦{line.lineTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => changeQty(line, -1)}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {line.qty}
              </span>
              <button
                type="button"
                onClick={() => changeQty(line, 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {quote && (
        <form
          onSubmit={handleCheckout}
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-card dark:shadow-card-dark"
        >
          <div className="rounded-xl px-4 py-3 mb-5 space-y-1.5 text-sm bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Products ({quote.count})</span>
              <span className="font-medium">₦{quote.productSum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Shopa fee (1%)</span>
              <span className="font-medium">₦{quote.shopaSum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Paystack fee</span>
              <span className="font-medium">₦{quote.paystackSum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1.5 mt-1.5 border-t border-dashed border-gray-200 dark:border-white/10">
              <span>Total</span>
              <span>₦{quote.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your name</label>
            <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="input-base" placeholder="e.g. Chidinma" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone number</label>
            <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="input-base" placeholder="+234 801 234 5678" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email <span className="opacity-50">(for receipt)</span></label>
            <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="input-base" placeholder="you@example.com" required />
          </div>

          {payError && (
            <div className="rounded-xl px-4 py-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
              <p className="text-sm text-red-600 dark:text-red-400">{payError}</p>
            </div>
          )}

          <button type="submit" disabled={placing || paying} className="btn-primary">
            {paying ? "Starting secure payment..." : placing ? "Creating order..." : `Pay ₦${quote.total.toLocaleString()}`}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">Secure payment powered by Paystack</p>
        </form>
      )}
    </div>
  );
}
