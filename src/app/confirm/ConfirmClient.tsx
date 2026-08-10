"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, StarIcon } from "@/components/Icons";

type Props = {
  status: string | null;
  product: string | null;
  amount: string | null;
  buyer: string | null;
  reference: string | null;
  message: string | null;
  sellerWhatsapp: string | null;
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
  message,
  sellerWhatsapp,
  pageStyle,
  containerMax,
  cardStyle,
  textColor,
  cardBg,
}: Props) {
  const isSuccess = status === "success";
  const hasSettings = Object.keys(pageStyle).length > 2;

  const sellerPhone = sellerWhatsapp
    ? sellerWhatsapp.replace(/[^0-9]/g, "")
    : "";

  const whatsappMessage = `Hi! I just paid for ${product} (₦${amount ? parseInt(amount).toLocaleString() : ""}) on your Shopa store. My name is ${buyer || "a buyer"}, reach me here.`;

  const whatsappUrl = sellerPhone
    ? `https://wa.me/${sellerPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

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
              Payment confirmed!
            </h1>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: hasSettings ? `${textColor}80` : undefined }}>
              Thank you{buyer ? `, ${buyer}` : ""}! Your order for{" "}
              <strong style={{ color: hasSettings ? textColor : undefined }}>{product}</strong>{" "}
              has been confirmed. The seller will verify your payment shortly.
            </p>

            <div
              className={`rounded-xl p-4 mb-6 ${hasSettings ? "" : "bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"}`}
              style={hasSettings ? { background: `${textColor}05`, border: `1px solid ${textColor}10` } : undefined}
            >
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: hasSettings ? `${textColor}50` : undefined }}>Amount paid</p>
              <p className="text-3xl font-bold mt-1" style={{ color: hasSettings ? textColor : undefined }}>
                ₦{amount ? parseInt(amount).toLocaleString() : "—"}
              </p>
              <p className="text-xs mt-2 font-mono" style={{ color: hasSettings ? `${textColor}40` : undefined }}>
                Ref: {reference}
              </p>
            </div>

            <p className="text-sm mb-4" style={{ color: hasSettings ? `${textColor}80` : undefined }}>
              Notify the seller on WhatsApp:
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Send payment proof on WhatsApp
            </a>

            <p className="text-xs mt-4" style={{ color: hasSettings ? `${textColor}40` : "#9ca3af" }}>
              Include your name and order reference when messaging
            </p>

            {/* Review Section */}
            <ReviewSection
              productId={null}
              orderId={reference}
              buyerName={buyer || ""}
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
  productId,
  orderId,
  buyerName,
  hasSettings,
  textColor,
}: {
  productId: string | null;
  orderId: string | null;
  buyerName: string;
  hasSettings: boolean;
  textColor: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId,
          buyer_name: buyerName,
          rating,
          comment: comment || undefined,
        }),
      });
      setSubmitted(true);
    } catch {}
    setLoading(false);
  };

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
