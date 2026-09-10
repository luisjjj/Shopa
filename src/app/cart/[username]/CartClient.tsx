"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { readableTextOn } from "@/lib/contrast";
import { loadCart, setLineQty, clearCart, type CartLine } from "@/lib/cart";

export type CartTheme = {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  cardBg: string;
  fontFamily: string;
  fontSize: string;
  cardBorderRadius: string;
  cardStyle: string;
} | null;

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

function getCardRadius(radius: string): string {
  switch (radius) {
    case "none": return "0";
    case "sm": return "0.375rem";
    case "lg": return "1rem";
    case "xl": return "1.5rem";
    case "pill": return "9999px";
    default: return "1rem";
  }
}

export default function CartClient({
  sellerId,
  username,
  settings,
}: {
  sellerId: string;
  username: string;
  settings: CartTheme;
}) {
  const s = settings;
  const primaryColor = s?.primaryColor || "#ed7712";
  const cardBg = s?.cardBg || "";
  // Everything sits on the card surface: guarantee the seller's text
  // color is actually readable on it.
  const textColor = s?.textColor
    ? readableTextOn(s.cardBg || "#ffffff", s.textColor)
    : "";
  const cardRadius = getCardRadius(s?.cardBorderRadius || "md");
  const hasBordered = s?.cardStyle === "bordered" || s?.cardStyle === "outlined";
  const hasShadow = s?.cardStyle === "shadow";

  const surface = (extra?: React.CSSProperties): React.CSSProperties | undefined =>
    s
      ? {
          background: cardBg,
          borderRadius: cardRadius,
          border: hasBordered ? `1px solid ${textColor}15` : undefined,
          boxShadow: hasShadow ? "0 10px 25px rgba(0,0,0,0.1)" : undefined,
          ...extra,
        }
      : undefined;
  const surfaceClass = s
    ? ""
    : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] shadow-card dark:shadow-card-dark";

  const inputStyle = (extra?: React.CSSProperties): React.CSSProperties | undefined =>
    s
      ? {
          width: "100%",
          padding: "0.625rem 0.875rem",
          borderRadius: "0.75rem",
          border: `1px solid ${textColor}20`,
          background: `${textColor}05`,
          color: textColor,
          fontSize: "inherit",
          fontFamily: "inherit",
          outline: "none",
          ...extra,
        }
      : undefined;

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
      <div
        className={`${surfaceClass} rounded-2xl p-6 text-center`}
        style={surface()}
      >
        <p className="text-xs uppercase tracking-wider font-medium" style={{ color: s ? `${textColor}60` : undefined }}>
          Amount to pay
        </p>
        <p className="text-3xl font-bold mt-1" style={{ color: s ? textColor : undefined }}>
          ₦{payTotal.toLocaleString()}
        </p>
        <button
          onClick={() => {
            window.location.href = payUrl;
          }}
          className={s ? "" : "btn-primary mt-6"}
          style={s ? {
            width: "100%",
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            background: primaryColor,
            color: "#fff",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          } : undefined}
        >
          Pay ₦{payTotal.toLocaleString()} securely
        </button>
        <p className="text-xs mt-3" style={{ color: s ? `${textColor}50` : undefined }}>
          You&apos;ll be redirected to Paystack
        </p>
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
      <div
        className={`${surfaceClass} rounded-2xl p-8 text-center`}
        style={surface()}
      >
        <p className="font-semibold" style={{ color: s ? textColor : undefined }}>Your cart is empty</p>
        <p className="text-sm mt-1 mb-5" style={{ color: s ? `${textColor}70` : undefined }}>
          Add products from the store to get started
        </p>
        <Link
          href={`/${username}`}
          className="inline-block text-sm font-semibold px-6 py-3 rounded-xl transition-all text-white"
          style={{ background: primaryColor }}
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
            className={`${surfaceClass} rounded-xl p-3 flex items-center gap-3`}
            style={surface()}
          >
            {line.image_url ? (
              <img src={line.image_url} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            ) : (
              <div
                className="w-12 h-12 rounded-lg shrink-0"
                style={{ background: s ? `${textColor}08` : undefined }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: s ? textColor : undefined }}>
                {line.productName}
              </p>
              {line.variantName && (
                <p className="text-xs truncate" style={{ color: s ? `${textColor}60` : undefined }}>
                  {line.variantName}
                </p>
              )}
              <p className="text-sm font-bold mt-0.5" style={{ color: s ? primaryColor : undefined }}>
                ₦{line.lineTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => changeQty(line, -1)}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg font-bold transition-colors"
                style={s ? { background: `${textColor}08`, color: textColor } : undefined}
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-semibold" style={{ color: s ? textColor : undefined }}>
                {line.qty}
              </span>
              <button
                type="button"
                onClick={() => changeQty(line, 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg font-bold transition-colors"
                style={s ? { background: `${textColor}08`, color: textColor } : undefined}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          className={`rounded-xl px-4 py-3 ${s ? "" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"}`}
          style={s ? { background: "#fef2f2", border: "1px solid #fecaca" } : undefined}
        >
          <p className="text-sm" style={{ color: s ? "#dc2626" : undefined }}>{error}</p>
        </div>
      )}

      {quote && (
        <form
          onSubmit={handleCheckout}
          className={`${surfaceClass} rounded-2xl p-6`}
          style={surface()}
        >
          <div
            className={`rounded-xl px-4 py-3 mb-5 space-y-1.5 text-sm ${s ? "" : "bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"}`}
            style={s ? { background: `${textColor}05`, border: `1px solid ${textColor}10` } : undefined}
          >
            <div className="flex justify-between" style={{ color: s ? `${textColor}90` : undefined }}>
              <span>Products ({quote.count})</span>
              <span className="font-medium">₦{quote.productSum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between" style={{ color: s ? `${textColor}90` : undefined }}>
              <span>Shopa fee (1%)</span>
              <span className="font-medium">₦{quote.shopaSum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between" style={{ color: s ? `${textColor}90` : undefined }}>
              <span>Paystack fee</span>
              <span className="font-medium">₦{quote.paystackSum.toLocaleString()}</span>
            </div>
            <div
              className="flex justify-between font-bold pt-1.5 mt-1.5 border-t border-dashed"
              style={{
                color: s ? textColor : undefined,
                borderColor: s ? `${textColor}20` : undefined,
              }}
            >
              <span>Total</span>
              <span>₦{quote.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: s ? `${textColor}bb` : undefined }}>
              Your name
            </label>
            <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={s ? "" : "input-base"} style={inputStyle()} placeholder="e.g. Chidinma" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: s ? `${textColor}bb` : undefined }}>
              Phone number
            </label>
            <input type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className={s ? "" : "input-base"} style={inputStyle()} placeholder="+234 801 234 5678" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: s ? `${textColor}bb` : undefined }}>
              Email <span className="opacity-50">(for receipt)</span>
            </label>
            <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className={s ? "" : "input-base"} style={inputStyle()} placeholder="you@example.com" required />
          </div>

          {payError && (
            <div
              className={`rounded-xl px-4 py-3 mb-5 ${s ? "" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"}`}
              style={s ? { background: "#fef2f2", border: "1px solid #fecaca" } : undefined}
            >
              <p className="text-sm" style={{ color: s ? "#dc2626" : undefined }}>{payError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={placing || paying}
            className={s ? "" : "btn-primary"}
            style={s ? {
              width: "100%",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              background: primaryColor,
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: placing || paying ? "not-allowed" : "pointer",
              opacity: placing || paying ? 0.5 : 1,
            } : undefined}
          >
            {paying ? "Starting secure payment..." : placing ? "Creating order..." : `Pay ₦${quote.total.toLocaleString()}`}
          </button>
          <p className="text-xs text-center mt-3" style={{ color: s ? `${textColor}50` : undefined }}>
            Secure payment powered by Paystack
          </p>
        </form>
      )}
    </div>
  );
}
