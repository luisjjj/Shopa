"use client";

import { useState } from "react";

type CheckoutSettings = {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  cardBg: string;
  fontFamily: string;
  fontSize: string;
  cardBorderRadius: string;
  cardStyle: string;
} | null;

type Props = {
  productId: string;
  productName: string;
  productPrice: number;
  sellerId: string;
  settings: CheckoutSettings;
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

export default function CheckoutForm({
  productId,
  productName,
  productPrice,
  sellerId,
  settings,
}: Props) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const s = settings;
  const primaryColor = s?.primaryColor || "#ed7712";
  const textColor = s?.textColor || "";
  const cardBg = s?.cardBg || "";
  const cardRadius = getCardRadius(s?.cardBorderRadius || "md");
  const hasBordered = s?.cardStyle === "bordered" || s?.cardStyle === "outlined";
  const hasShadow = s?.cardStyle === "shadow";

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sellerId,
          buyerName,
          buyerPhone,
          amount: productPrice,
          productName,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleCheckout}
      className={s ? "" : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-card dark:shadow-card-dark"}
      style={s ? {
        background: cardBg,
        borderRadius: cardRadius,
        padding: "1.5rem",
        border: hasBordered ? `1px solid ${textColor}15` : undefined,
        boxShadow: hasShadow ? "0 10px 25px rgba(0,0,0,0.1)" : undefined,
      } : undefined}
    >
      <h2
        className="text-lg font-bold mb-5"
        style={{ color: s ? textColor : undefined }}
      >
        Complete your order
      </h2>

      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: s ? `${textColor}bb` : undefined }}
        >
          Your name
        </label>
        <input
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className={s ? "" : "input-base"}
          style={s ? {
            width: "100%",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.75rem",
            border: `1px solid ${textColor}20`,
            background: `${textColor}05`,
            color: textColor,
            fontSize: "inherit",
            fontFamily: "inherit",
            outline: "none",
          } : undefined}
          placeholder="e.g. Chidinma"
          required
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: s ? `${textColor}bb` : undefined }}
        >
          Phone number
        </label>
        <input
          type="tel"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          className={s ? "" : "input-base"}
          style={s ? {
            width: "100%",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.75rem",
            border: `1px solid ${textColor}20`,
            background: `${textColor}05`,
            color: textColor,
            fontSize: "inherit",
            fontFamily: "inherit",
            outline: "none",
          } : undefined}
          placeholder="+234 801 234 5678"
          required
        />
      </div>

      {error && (
        <div
          className={`rounded-xl px-4 py-3 mb-5 ${s ? "" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"}`}
          style={s ? { background: "#fef2f2", border: "1px solid #fecaca" } : undefined}
        >
          <p className="text-sm" style={{ color: s ? "#dc2626" : undefined }}>
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !buyerName || !buyerPhone}
        className={s ? "" : "btn-primary flex items-center justify-center gap-2"}
        style={s ? {
          width: "100%",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.75rem",
          background: primaryColor,
          color: "#fff",
          fontWeight: 600,
          fontSize: "inherit",
          fontFamily: "inherit",
          border: "none",
          cursor: loading || !buyerName || !buyerPhone ? "not-allowed" : "pointer",
          opacity: loading || !buyerName || !buyerPhone ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          transition: "all 0.15s",
        } : undefined}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to payment...
          </>
        ) : `Pay ₦${productPrice.toLocaleString()}`}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: s ? `${textColor}40` : undefined }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-xs" style={{ color: s ? `${textColor}50` : undefined }}>
          Secure payment powered by Paystack
        </p>
      </div>
    </form>
  );
}
