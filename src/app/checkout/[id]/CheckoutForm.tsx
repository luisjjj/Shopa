"use client";

import { useState, useEffect, useCallback } from "react";

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

type Variant = {
  id: string;
  name: string;
  stock: number | null;
  price_override: number | null;
};

type Props = {
  productId: string;
  productName: string;
  productPrice: number;
  sellerId: string;
  sellerWhatsapp: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  hasVariants: boolean;
  variants: Variant[];
  settings: CheckoutSettings;
  onDiscountApplied?: (promoId: string, discount: number) => void;
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
  sellerWhatsapp,
  bankName,
  accountNumber,
  accountName,
  hasVariants,
  variants,
  settings,
}: Props) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    id: string;
    code: string;
    discount_percent: number | null;
    discount_amount: number | null;
  } | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );

  const [showModal, setShowModal] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reference, setReference] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [copied, setCopied] = useState<string | null>(null);

  const s = settings;
  const primaryColor = s?.primaryColor || "#ed7712";
  const textColor = s?.textColor || "";
  const cardBg = s?.cardBg || "";
  const cardRadius = getCardRadius(s?.cardBorderRadius || "md");
  const hasBordered = s?.cardStyle === "bordered" || s?.cardStyle === "outlined";
  const hasShadow = s?.cardStyle === "shadow";

  const selectedVariant = hasVariants
    ? variants.find((v) => v.id === selectedVariantId)
    : null;
  const basePrice = selectedVariant?.price_override ?? productPrice;
  const discountAmount = appliedPromo
    ? appliedPromo.discount_percent
      ? Math.round((basePrice * appliedPromo.discount_percent) / 100)
      : appliedPromo.discount_amount || 0
    : 0;
  const displayPrice = Math.max(0, basePrice - discountAmount);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    if (!showModal || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [showModal, timeLeft]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), seller_id: sellerId }),
      });

      const data = await res.json();

      if (data.error) {
        setPromoError(data.error);
        setPromoLoading(false);
        return;
      }

      setAppliedPromo(data);
      setPromoLoading(false);
    } catch {
      setPromoError("Failed to validate promo code");
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

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
          buyerEmail,
          amount: displayPrice,
          productName,
          promoCodeId: appliedPromo?.id || null,
          discount: discountAmount,
          variantId: selectedVariantId,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setOrderId(data.orderId);
      setReference(data.reference);
      setShowModal(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    } catch {}

    const params = new URLSearchParams({
      status: "success",
      product: productName,
      amount: displayPrice.toString(),
      buyer: buyerName,
      reference,
      seller: sellerId,
      whatsapp: sellerWhatsapp,
    });

    window.location.href = `/confirm?${params.toString()}`;
  };

  if (showModal) {
    return (
      <>
        <style>{`
          @keyframes bank-modal-in {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .bank-modal-enter { animation: bank-modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.4; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
        `}</style>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bank-modal-enter w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: s ? cardBg : "#fff",
              borderRadius: cardRadius,
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Timer header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: `${primaryColor}10` }}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: timeLeft > 60 ? "#22c55e" : timeLeft > 0 ? "#f59e0b" : "#ef4444" }}
                  />
                  {timeLeft > 60 && (
                    <div
                      className="absolute inset-0 w-2.5 h-2.5 rounded-full pulse-ring"
                      style={{ background: "#22c55e" }}
                    />
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: s ? textColor : "#374151" }}
                >
                  {timeLeft > 0 ? "Complete payment within" : "Time expired"}
                </span>
              </div>
              <span
                className="text-lg font-bold font-mono tabular-nums"
                style={{ color: timeLeft > 60 ? primaryColor : timeLeft > 0 ? "#f59e0b" : "#ef4444" }}
              >
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: s ? `${textColor}60` : "#9ca3af" }}>
                  Amount to pay
                </p>
                {discountAmount > 0 && (
                  <p className="text-sm line-through mb-0.5" style={{ color: s ? `${textColor}40` : "#d1d5db" }}>
                    ₦{productPrice.toLocaleString()}
                  </p>
                )}
                <p className="text-3xl font-bold" style={{ color: s ? textColor : "#111827" }}>
                  ₦{displayPrice.toLocaleString()}
                </p>
                {discountAmount > 0 && (
                  <p className="text-xs font-medium mt-1" style={{ color: "#16a34a" }}>
                    {appliedPromo?.discount_percent
                      ? `${appliedPromo.discount_percent}% off`
                      : `₦${discountAmount.toLocaleString()} off`}
                    {" "}&mdash; {appliedPromo?.code}
                  </p>
                )}
              </div>

              {/* Bank details */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: s ? `${textColor}05` : "#f9fafb",
                  border: `1px solid ${s ? `${textColor}10` : "#e5e7eb"}`,
                }}
              >
                <p className="text-xs uppercase tracking-wider font-medium" style={{ color: s ? `${textColor}50` : "#9ca3af" }}>
                  Transfer to this account
                </p>

                <BankDetailRow
                  label="Bank"
                  value={bankName}
                  copied={copied === "bank"}
                  onCopy={() => copyToClipboard(bankName, "bank")}
                  textColor={textColor}
                  s={s}
                />
                <BankDetailRow
                  label="Account Number"
                  value={accountNumber}
                  copied={copied === "account"}
                  onCopy={() => copyToClipboard(accountNumber, "account")}
                  textColor={textColor}
                  s={s}
                  mono
                />
                <BankDetailRow
                  label="Account Name"
                  value={accountName}
                  copied={copied === "name"}
                  onCopy={() => copyToClipboard(accountName, "name")}
                  textColor={textColor}
                  s={s}
                />
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirmPayment}
                disabled={timeLeft <= 0}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: timeLeft > 0 ? primaryColor : "#9ca3af",
                }}
              >
                I&apos;ve sent the money
              </button>

              <p className="text-center text-xs" style={{ color: s ? `${textColor}40` : "#9ca3af" }}>
                After clicking, you&apos;ll be asked to confirm on WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Original form behind modal (hidden) */}
        <div className="hidden">
          <div>Loading...</div>
        </div>
      </>
    );
  }

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

      {/* Variant Selector */}
      {hasVariants && variants.length > 0 && (
        <div className="mb-5">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: s ? `${textColor}bb` : undefined }}
          >
            Choose a variant
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    isSelected
                      ? "border-transparent text-white"
                      : s
                        ? "border-current"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                  style={
                    s
                      ? {
                          background: isSelected ? primaryColor : "transparent",
                          color: isSelected ? "#fff" : `${textColor}bb`,
                          borderColor: isSelected ? "transparent" : `${textColor}20`,
                        }
                      : isSelected
                        ? { background: primaryColor }
                        : undefined
                  }
                >
                  {v.name}
                  {v.price_override != null && (
                    <span className="ml-1 opacity-70">
                      ₦{v.price_override.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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

      <div className="mb-4">
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

      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: s ? `${textColor}bb` : undefined }}
        >
          Email <span className="opacity-50">(optional, for receipt)</span>
        </label>
        <input
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
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
          placeholder="you@example.com"
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: s ? `${textColor}bb` : undefined }}
        >
          Delivery address <span className="opacity-50">(optional)</span>
        </label>
        <textarea
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          rows={2}
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
            resize: "none",
          } : undefined}
          placeholder="Where should we deliver?"
        />
      </div>

      {/* Promo Code Section */}
      <div className="mb-5">
        {!showPromo && !appliedPromo && (
          <button
            type="button"
            onClick={() => setShowPromo(true)}
            className="text-sm font-medium transition-colors"
            style={{ color: s ? primaryColor : undefined }}
          >
            Have a promo code?
          </button>
        )}

        {showPromo && !appliedPromo && (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
              placeholder="Enter code"
              className={s ? "" : "flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-mono tracking-wide"}
              style={s ? {
                flex: 1,
                padding: "0.625rem 0.875rem",
                borderRadius: "0.75rem",
                border: `1px solid ${textColor}20`,
                background: `${textColor}05`,
                color: textColor,
                fontSize: "inherit",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
                outline: "none",
              } : undefined}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoCode.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: primaryColor,
                color: "#fff",
              }}
            >
              {promoLoading ? "..." : "Apply"}
            </button>
          </div>
        )}

        {appliedPromo && (
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                {appliedPromo.code}
              </span>
              <span className="text-green-600 dark:text-green-400 text-xs">
                &mdash; {appliedPromo.discount_percent
                  ? `${appliedPromo.discount_percent}% off`
                  : `₦${appliedPromo.discount_amount?.toLocaleString()} off`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {promoError && (
          <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
        )}
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
            Creating order...
          </>
        ) : `Pay ₦${displayPrice.toLocaleString()}`}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: s ? `${textColor}40` : undefined }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-xs" style={{ color: s ? `${textColor}50` : undefined }}>
          Secure bank transfer
        </p>
      </div>
    </form>
  );
}

function BankDetailRow({
  label,
  value,
  copied,
  onCopy,
  textColor,
  s,
  mono,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  textColor: string;
  s: CheckoutSettings;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px]" style={{ color: s ? `${textColor}50` : "#9ca3af" }}>{label}</p>
        <p
          className={`text-sm font-semibold ${mono ? "font-mono tracking-wider" : ""}`}
          style={{ color: s ? textColor : "#111827" }}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="text-xs px-2.5 py-1 rounded-lg transition-all font-medium"
        style={{
          background: copied ? "#dcfce7" : s ? `${textColor}08` : "#f3f4f6",
          color: copied ? "#16a34a" : s ? `${textColor}60` : "#6b7280",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
