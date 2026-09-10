"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";
import { readableTextOn } from "@/lib/contrast";

type QuickViewProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number | null;
  has_variants: boolean;
};

type QuickViewVariant = {
  id: string;
  name: string;
  stock: number | null;
  price_override: number | null;
};

type QuickViewTheme = {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  cardBg: string;
  fontFamily: string;
  fontSize: string;
  cardBorderRadius: string;
  cardStyle: string;
} | null;

type QuickViewReview = {
  rating: number;
  comment: string | null;
  buyer_name: string | null;
};

type Props = {
  product: QuickViewProduct | null;
  variants: QuickViewVariant[];
  sellerId: string;
  storeUsername: string;
  theme: QuickViewTheme;
  defaultOpen?: boolean;
  onClose: () => void;
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

export default function ProductQuickView({
  product,
  variants,
  sellerId,
  storeUsername,
  theme,
  defaultOpen,
  onClose,
}: Props) {
  const productId = product?.id ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<QuickViewReview[]>([]);
  const [isOpen, setIsOpen] = useState(defaultOpen ?? true);

  useEffect(() => {
    setIsOpen(defaultOpen ?? true);
  }, [productId, defaultOpen]);

  useEffect(() => {
    setSelectedVariantId(variants.length > 0 ? variants[0].id : null);
    setQty(1);
    setAdded(false);
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [productId, onClose]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    fetch(`/api/reviews?product_id=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data as { reviews?: QuickViewReview[] }).reviews;
        setReviews(Array.isArray(list) ? list.slice(0, 2) : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!product || !isOpen) return null;

  const s = theme;
  const primaryColor = s?.primaryColor || "#ed7712";
  const cardBg = s?.cardBg || "";
  const textColor = s?.textColor
    ? readableTextOn(s.cardBg || "#ffffff", s.textColor)
    : "";
  const cardRadius = getCardRadius(s?.cardBorderRadius || "md");
  const hasBordered = s?.cardStyle === "bordered" || s?.cardStyle === "outlined";
  const hasShadow = s?.cardStyle === "shadow";

  const selectedVariant = product.has_variants
    ? variants.find((v) => v.id === selectedVariantId) ?? null
    : null;
  const displayPrice = selectedVariant?.price_override ?? product.price;
  const effectiveStock = selectedVariant?.stock ?? product.stock;
  const maxQty = Math.max(1, Math.min(99, effectiveStock ?? 99));
  const outOfStock = effectiveStock !== null && effectiveStock <= 0;
  const lowStock =
    effectiveStock !== null && effectiveStock > 0 && effectiveStock <= 5;

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleAdd = () => {
    if (outOfStock) return;
    addToCart(
      sellerId,
      product.id,
      product.has_variants ? selectedVariantId : null,
      Math.min(qty, maxQty)
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(
      sellerId,
      product.id,
      product.has_variants ? selectedVariantId : null,
      Math.min(qty, maxQty)
    );
    window.location.href = `/cart/${storeUsername}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className={
          s
            ? "relative w-full max-w-lg sm:max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            : "relative w-full max-w-lg sm:max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] shadow-card dark:shadow-card-dark"
        }
        style={
          s
            ? {
                background: cardBg,
                borderRadius: cardRadius,
                border: hasBordered ? `1px solid ${textColor}15` : undefined,
                boxShadow: hasShadow
                  ? "0 10px 25px rgba(0,0,0,0.1)"
                  : "0 25px 60px rgba(0,0,0,0.3)",
                fontFamily: s.fontFamily || undefined,
                fontSize: s.fontSize || undefined,
              }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close quick view"
          className={
            s
              ? "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
              : "absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gray-900/70 text-white backdrop-blur flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
          }
          style={
            s
              ? { background: `${textColor}15`, color: textColor }
              : undefined
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 sm:h-80 object-cover"
          />
        ) : (
          <div
            className={
              s
                ? "w-full h-64 sm:h-80 flex items-center justify-center text-4xl font-bold"
                : "w-full h-64 sm:h-80 flex items-center justify-center text-4xl font-bold bg-gray-100 dark:bg-white/[0.04] text-gray-300 dark:text-gray-700"
            }
            style={s ? { background: `${textColor}08`, color: `${textColor}30` } : undefined}
          >
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2
              className={
                s
                  ? "text-xl sm:text-2xl font-bold break-words"
                  : "text-xl sm:text-2xl font-bold break-words text-gray-900 dark:text-white"
              }
              style={{ color: s ? textColor : undefined }}
            >
              {product.name}
            </h2>
            {effectiveStock === null ? (
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                In stock
              </span>
            ) : outOfStock ? (
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                Low stock · {effectiveStock} left
              </span>
            ) : (
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                In stock
              </span>
            )}
          </div>

          <p
            className="text-2xl font-bold mb-3"
            style={{ color: s ? primaryColor : undefined }}
          >
            <span className={s ? "" : "text-gray-900 dark:text-white"}>
              ₦{displayPrice.toLocaleString()}
            </span>
          </p>

          {product.description && (
            <p
              className={
                s
                  ? "text-sm leading-relaxed mb-5 whitespace-pre-line break-words"
                  : "text-sm leading-relaxed mb-5 whitespace-pre-line break-words text-gray-600 dark:text-gray-400"
              }
              style={{ color: s ? `${textColor}bb` : undefined }}
            >
              {product.description}
            </p>
          )}

          {product.has_variants && variants.length > 0 && (
            <div className="mb-5">
              <p
                className={
                  s
                    ? "block text-sm font-medium mb-2"
                    : "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                }
                style={{ color: s ? `${textColor}bb` : undefined }}
              >
                Choose a variant
              </p>
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

          <div className="flex items-center gap-3 mb-5">
            <span
              className={
                s
                  ? "text-sm font-medium"
                  : "text-sm font-medium text-gray-700 dark:text-gray-300"
              }
              style={{ color: s ? `${textColor}bb` : undefined }}
            >
              Qty
            </span>
            <div
              className={
                s
                  ? "flex items-center gap-1 rounded-full border px-1 py-1"
                  : "flex items-center gap-1 rounded-full border border-gray-200 dark:border-white/10 px-1 py-1"
              }
              style={s ? { borderColor: `${textColor}20` } : undefined}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-30"
                style={{ color: s ? textColor : undefined }}
              >
                −
              </button>
              <span
                className={
                  s
                    ? "min-w-[2rem] text-center text-sm font-bold"
                    : "min-w-[2rem] text-center text-sm font-bold text-gray-900 dark:text-white"
                }
                style={{ color: s ? textColor : undefined }}
              >
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={qty >= maxQty}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-30"
                style={{ color: s ? textColor : undefined }}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: primaryColor }}
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={
                s
                  ? "flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  : "flex-1 py-3 rounded-xl font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-200 transition-all active:scale-[0.98] hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              }
              style={
                s
                  ? {
                      background: "transparent",
                      color: textColor,
                      border: `1px solid ${textColor}25`,
                    }
                  : undefined
              }
            >
              Buy now
            </button>
          </div>

          {reviews.length > 0 && (
            <div
              className={
                s
                  ? "rounded-xl px-4 py-3 space-y-3"
                  : "rounded-xl px-4 py-3 space-y-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"
              }
              style={
                s
                  ? {
                      background: `${textColor}05`,
                      border: `1px solid ${textColor}10`,
                    }
                  : undefined
              }
            >
              <p
                className={
                  s
                    ? "text-xs uppercase tracking-wider font-semibold"
                    : "text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400"
                }
                style={{ color: s ? `${textColor}70` : undefined }}
              >
                Buyer reviews
              </p>
              {reviews.map((r, i) => (
                <div key={i}>
                  <span className="text-amber-400 text-sm tracking-tight">
                    {"★".repeat(Math.max(0, Math.min(5, r.rating)))}
                    {"☆".repeat(5 - Math.max(0, Math.min(5, r.rating)))}
                  </span>
                  {r.comment && (
                    <p
                      className={
                        s
                          ? "text-sm mt-0.5 break-words"
                          : "text-sm mt-0.5 break-words text-gray-700 dark:text-gray-300"
                      }
                      style={{ color: s ? `${textColor}cc` : undefined }}
                    >
                      {r.comment}
                    </p>
                  )}
                  {r.buyer_name && (
                    <p
                      className={
                        s
                          ? "text-xs mt-0.5"
                          : "text-xs mt-0.5 text-gray-500 dark:text-gray-500"
                      }
                      style={{ color: s ? `${textColor}70` : undefined }}
                    >
                      — {r.buyer_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
