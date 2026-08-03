"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@/components/Icons";

type StoreSettings = {
  primary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  card_background: string;
  font_style: string;
  font_size: string;
  card_border_radius: string;
  card_style: string;
  container_width: string;
} | null;

function getFontFamily(style?: string): string {
  switch (style) {
    case "serif": return "Georgia, 'Times New Roman', serif";
    case "mono": return "'Courier New', monospace";
    case "elegant": return "'Playfair Display', Georgia, serif";
    case "clean": return "'Lato', 'Helvetica Neue', sans-serif";
    case "bold": return "'Oswald', 'Impact', sans-serif";
    case "thin": return "'Raleway', 'Helvetica Neue', sans-serif";
    case "rounded": return "'Nunito', 'Helvetica Neue', sans-serif";
    case "geometric": return "'Inter', 'Helvetica Neue', sans-serif";
    case "editorial": return "'Merriweather', Georgia, serif";
    case "modern": return "'Space Grotesk', 'Helvetica Neue', sans-serif";
    case "friendly": return "'DM Sans', 'Helvetica Neue', sans-serif";
    default: return "var(--font-geist-sans), system-ui, sans-serif";
  }
}

function getFontSize(size?: string): string {
  switch (size) {
    case "xsmall": return "12px";
    case "small": return "13px";
    case "large": return "17px";
    case "xlarge": return "19px";
    default: return "15px";
  }
}

function getCardRadius(radius?: string): string {
  switch (radius) {
    case "none": return "0";
    case "sm": return "0.375rem";
    case "lg": return "1rem";
    case "xl": return "1.5rem";
    case "pill": return "9999px";
    default: return "1rem";
  }
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const product = searchParams.get("product");
  const amount = searchParams.get("amount");
  const buyer = searchParams.get("buyer");
  const reference = searchParams.get("reference");
  const message = searchParams.get("message");
  const sellerId = searchParams.get("seller");

  const isSuccess = status === "success";
  const [settings, setSettings] = useState<StoreSettings>(null);

  useEffect(() => {
    if (!sellerId) return;
    fetch(`/api/storefront-settings?userId=${sellerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(() => {});
  }, [sellerId]);

  const s = settings;
  const fontFamily = getFontFamily(s?.font_style);
  const fontSize = getFontSize(s?.font_size);
  const bgColor = s?.background_color || "#faf9f7";
  const textColor = s?.text_color || "#1a1a1a";
  const cardBg = s?.card_background || "#ffffff";
  const cardRadius = getCardRadius(s?.card_border_radius);
  const hasBordered = s?.card_style === "bordered" || s?.card_style === "outlined";
  const hasShadow = s?.card_style === "shadow";

  const pageStyle: React.CSSProperties = s
    ? { fontFamily, fontSize, color: textColor, background: bgColor }
    : { fontFamily, fontSize };

  const containerMax = (() => {
    switch (s?.container_width) {
      case "narrow": return "max-w-sm";
      case "wide": return "max-w-2xl";
      case "full": return "max-w-4xl";
      default: return "max-w-md";
    }
  })();

  const cardStyle: React.CSSProperties = s ? {
    background: cardBg,
    borderRadius: cardRadius,
    padding: "2rem",
    border: hasBordered ? `1px solid ${textColor}15` : undefined,
    boxShadow: hasShadow ? "0 10px 25px rgba(0,0,0,0.1)" : undefined,
  } : {};

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${s ? "" : "bg-gray-50/80 dark:bg-[#0a0a0a]"}`} style={pageStyle}>
      <div className={`w-full text-center animate-scale-in ${containerMax}`}>
        {isSuccess ? (
          <div className={s ? "" : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark"} style={s ? cardStyle : { borderRadius: cardRadius }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <CheckCircleIcon style={{ color: "#22c55e" }} size={32} />
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: s ? textColor : undefined }}>
              Order confirmed!
            </h1>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: s ? `${textColor}80` : undefined }}>
              Thank you{buyer ? `, ${buyer}` : ""}! Your order for{" "}
              <strong style={{ color: s ? textColor : undefined }}>{product}</strong> has been placed.
            </p>

            <div
              className={`rounded-xl p-4 mb-6 ${s ? "" : "bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"}`}
              style={s ? { background: `${textColor}05`, border: `1px solid ${textColor}10` } : undefined}
            >
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: s ? `${textColor}50` : undefined }}>Amount paid</p>
              <p className="text-3xl font-bold mt-1" style={{ color: s ? textColor : undefined }}>
                ₦{amount ? parseInt(amount).toLocaleString() : "—"}
              </p>
              <p className="text-xs mt-2 font-mono" style={{ color: s ? `${textColor}40` : undefined }}>
                Ref: {reference}
              </p>
            </div>

            <p className="text-sm mb-4" style={{ color: s ? `${textColor}80` : undefined }}>
              Let the seller know you&apos;ve paid:
            </p>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hi! I just paid for ${product} (₦${amount ? parseInt(amount).toLocaleString() : ""}) on your Shopa store. My name is ${buyer || "a buyer"}, reach me here.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Notify seller on WhatsApp
            </a>
          </div>
        ) : (
          <div className={s ? "" : "bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-8 shadow-card dark:shadow-card-dark"} style={s ? cardStyle : { borderRadius: cardRadius }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <XCircleIcon style={{ color: "#ef4444" }} size={32} />
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: s ? textColor : undefined }}>
              Something went wrong
            </h1>
            <p className="mb-8 text-sm" style={{ color: s ? `${textColor}80` : undefined }}>
              {message || "Payment could not be verified."}
            </p>

            <a
              href="/"
              className={`inline-flex items-center justify-center font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] ${s ? "" : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"}`}
              style={s ? {
                background: textColor,
                color: cardBg,
              } : undefined}
            >
              Go back home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/80 dark:bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Verifying payment...</p>
          </div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
