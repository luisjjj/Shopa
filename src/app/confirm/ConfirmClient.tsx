"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, StarIcon } from "@/components/Icons";

type Props = {
  status: string | null;
  product: string | null;
  amount: string | null;
  buyer: string | null;
  reference: string | null;
  orderId: string | null;
  paid: boolean;
  message: string | null;
  pageStyle: React.CSSProperties;
  containerMax: string;
  cardStyle: React.CSSProperties;
  textColor: string;
  cardBg: string;
  primaryColor: string;
};

export default function ConfirmClient({
  status,
  product,
  amount,
  buyer,
  reference,
  orderId,
  paid,
  message,
  pageStyle,
  containerMax,
  cardStyle,
  textColor,
  cardBg,
}: Props) {
  const isSuccess = status === "success";
  const hasSettings = Object.keys(pageStyle).length > 2;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${hasSettings ? "" : "bg-gray-50/80 dark:bg-[#0a0a0a]"}`}
      style={pageStyle}
    >
      <div className={`w-full text-center animate-scale-in ${containerMax}`}>
        {isSuccess ? (
          <div
            className={hasSettings ? "" : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark"}
            style={hasSettings ? cardStyle : { borderRadius: "1rem" }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <CheckCircleIcon style={{ color: "#22c55e" }} size={32} />
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: hasSettings ? textColor : undefined }}>
              {paid ? "Payment successful!" : "Order pending"}
            </h1>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: hasSettings ? `${textColor}80` : undefined }}>
              {paid ? (
                <>Thank you{buyer ? `, ${buyer}` : ""}! Your payment for{" "}
                <strong style={{ color: hasSettings ? textColor : undefined }}>{product}</strong>{" "}
                went through. The seller will fulfill your order shortly.</>
              ) : (
                <>Thanks{buyer ? `, ${buyer}` : ""}! Your order for{" "}
                <strong style={{ color: hasSettings ? textColor : undefined }}>{product}</strong>{" "}
                is pending payment. If you already paid, please contact the seller directly.</>
              )}
            </p>

            <div
              className={`rounded-xl p-4 mb-6 ${hasSettings ? "" : "bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"}`}
              style={hasSettings ? { background: `${textColor}05`, border: `1px solid ${textColor}10` } : undefined}
            >
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: hasSettings ? `${textColor}50` : undefined }}>{paid ? "Amount paid" : "Order status"}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: hasSettings ? textColor : undefined }}>
                ₦{amount ? parseInt(amount).toLocaleString() : "—"}
              </p>
              <p className="text-xs mt-2 font-mono" style={{ color: hasSettings ? `${textColor}40` : undefined }}>
                Ref: {reference}
              </p>
            </div>

            {!paid && (
              <p className="text-sm" style={{ color: hasSettings ? `${textColor}80` : undefined }}>
                This payment hasn&apos;t been confirmed. If you already paid, please contact the seller directly.
              </p>
            )}

            {/* Review Section */}
            <ReviewSection
              orderId={orderId}
              hasSettings={hasSettings}
              textColor={textColor}
            />
          </div>
        ) : (
          <div
            className={hasSettings ? "" : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark"}
            style={hasSettings ? cardStyle : { borderRadius: "1rem" }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <XCircleIcon style={{ color: "#ef4444" }} size={32} />
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: hasSettings ? textColor : undefined }}>
              Something went wrong
            </h1>
            <p className="mb-8 text-sm" style={{ color: hasSettings ? `${textColor}80` : undefined }}>
              {message || "Payment could not be verified."}
            </p>

            <a
              href="/"
              className={`inline-flex items-center justify-center font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] ${hasSettings ? "" : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"}`}
              style={hasSettings ? { background: textColor, color: cardBg } : undefined}
            >
              Go back home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  orderId,
  hasSettings,
  textColor,
}: {
  orderId: string | null;
  hasSettings: boolean;
  textColor: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || !orderId) return;
    setLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          rating,
          comment: comment || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Could not submit review");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError("Network error — try again");
    }
    setLoading(false);
  };

  if (!orderId) return null;

  if (submitted) {
    return (
      <div
        className={`mt-6 pt-6 border-t ${hasSettings ? "" : "border-gray-100 dark:border-white/[0.06]"}`}
        style={hasSettings ? { borderColor: `${textColor}15` } : undefined}
      >
        <p className="text-sm font-medium text-center" style={{ color: hasSettings ? `${textColor}80` : undefined }}>
          Thanks for your review!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`mt-6 pt-6 border-t ${hasSettings ? "" : "border-gray-100 dark:border-white/[0.06]"}`}
      style={hasSettings ? { borderColor: `${textColor}15` } : undefined}
    >
      <p className="text-sm font-medium mb-3" style={{ color: hasSettings ? textColor : undefined }}>
        Rate your experience
      </p>
      <p className="text-xs mb-3" style={{ color: hasSettings ? `${textColor}60` : "#9ca3af" }}>
        Available once the seller confirms your payment — one review per order.
      </p>
      {formError && (
        <p className="text-xs mb-3 text-red-500">{formError}</p>
      )}

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <StarIcon
              size={24}
              style={{
                color: (hovered || rating) >= star ? "#f59e0b" : hasSettings ? `${textColor}25` : "#d1d5db",
                fill: (hovered || rating) >= star ? "#f59e0b" : "transparent",
              }}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        rows={2}
        className={`w-full text-sm rounded-xl px-3 py-2.5 mb-3 ${hasSettings ? "" : "bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400"}`}
        style={hasSettings ? {
          background: `${textColor}05`,
          border: `1px solid ${textColor}15`,
          color: textColor,
          outline: "none",
          resize: "none",
        } : undefined}
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || loading}
        className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${hasSettings ? "" : "bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"}`}
        style={hasSettings ? {
          background: rating > 0 ? "#ed7712" : `${textColor}15`,
          color: rating > 0 ? "#fff" : `${textColor}40`,
          cursor: rating > 0 ? "pointer" : "not-allowed",
        } : undefined}
      >
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}
