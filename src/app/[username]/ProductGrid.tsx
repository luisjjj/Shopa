"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageIcon } from "@/components/Icons";
import { ProductRating } from "./ProductRating";
import { CardStepper } from "@/components/CartButtons";
import ProductQuickView from "@/components/ProductQuickView";
import { readableTextOn } from "@/lib/contrast";

export type GridProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number | null;
  has_variants: boolean | null;
  category: string | null;
};

export type GridVariant = {
  id: string;
  name: string;
  stock: number | null;
  price_override: number | null;
};

export type GridTheme = {
  cardClasses: string;
  cardBgStyle: React.CSSProperties;
  cardInlineStyle: React.CSSProperties;
  useDynamicImage: boolean;
  imageAspect: string;
  imageRadius: string;
  textColor: string;
  accentColor: string;
  cardText: string;
  nameWeight: string;
  nameSize: string;
  priceClasses: string;
  priceStyle: React.CSSProperties;
  gridCols: string;
  gapSize: string;
  isHorizontal: boolean;
  isList: boolean;
  isMasonry: boolean;
  themed: boolean;
  showStockBadge: boolean;
  textAlign?: "left" | "center" | "right";
};

export type ModalTheme = {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  cardBg: string;
  fontFamily: string;
  fontSize: string;
  cardBorderRadius: string;
  cardStyle: string;
} | null;

export default function ProductGrid({
  products,
  variantsByProduct,
  theme,
  modalTheme,
  sellerId,
  username,
  vibe = "modern",
}: {
  products: GridProduct[];
  variantsByProduct: Record<string, GridVariant[]>;
  theme: GridTheme;
  modalTheme: ModalTheme;
  sellerId: string;
  username: string;
  vibe?: string;
}) {
  const t = theme;
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(products.map((p) => (p.category || "").trim()).filter(Boolean))
    );
    return cats;
  }, [products]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get("product");
      if (id && products.some((p) => p.id === id)) setQuickViewId(id);
    } catch {
      // ignore
    }
  }, [products]);

  const visible = activeCat ? products.filter((p) => (p.category || "").trim() === activeCat) : products;
  const quickViewProduct = quickViewId ? products.find((p) => p.id === quickViewId) || null : null;

  const closeQuickView = () => {
    setQuickViewId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("product");
      window.history.replaceState(null, "", url.toString());
    } catch {
      // ignore
    }
  };

  const chipClass = vibe === "street" || vibe === "market" ? "rounded-md" : "rounded-full";

  // Avoid a lonely orphan card when a store has a handful of products.
  const effectiveGridCols = useMemo(() => {
    if (!t.gridCols.includes("xl:grid-cols-4")) return t.gridCols;
    switch (visible.length) {
      case 1:
        return "grid-cols-1 max-w-sm mx-auto";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 5:
        return "grid-cols-2 md:grid-cols-3";
      default:
        return t.gridCols;
    }
  }, [t.gridCols, visible.length]);

  return (
    <div>
      {categories.length >= 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
          {["All", ...categories].map((c) => {
            const active = c === "All" ? activeCat === null : activeCat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c === "All" ? null : c)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 border transition-all active:scale-95 ${chipClass} ${
                  active ? "border-transparent" : ""
                }`}
                style={
                  active
                    ? { background: t.accentColor, color: readableTextOn(t.accentColor, "#ffffff") }
                    : { color: `${t.textColor}85`, borderColor: `${t.textColor}20` }
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: `${t.textColor}60` }}>
          Nothing in this category yet.
        </p>
      ) : (
        <div
          className={
            t.isHorizontal
              ? "flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory"
              : t.isList
                ? "space-y-2.5"
                : t.isMasonry
                  ? "columns-2 lg:columns-3 gap-4 lg:gap-5 [column-fill:_balance]"
                  : `grid ${effectiveGridCols} ${t.gapSize}`
          }
        >
          {visible.map((p, index) => {
            const vars = variantsByProduct[p.id] || [];
            const minPrice =
              p.has_variants && vars.length > 0
                ? Math.min(...vars.map((v) => (v.price_override != null ? v.price_override : p.price)))
                : null;
            const masonryAspect =
              index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/3]";
            const aspect = t.isMasonry ? masonryAspect : t.useDynamicImage ? "" : t.imageAspect;

            const media = (
              <div
                className={`relative overflow-hidden ${t.imageRadius} flex items-center justify-center ${
                  t.isList ? "w-24 sm:w-28 shrink-0" : "mb-3"
                } ${aspect} ${aspect ? "bg-gray-50 dark:bg-white/[0.04]" : "min-h-[180px]"}`}
                style={t.themed ? { background: `${t.textColor}08` } : undefined}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: t.themed ? `${t.textColor}10` : "rgba(0,0,0,0.04)" }}
                  >
                    <PackageIcon
                      size={26}
                      style={t.themed ? { color: `${t.textColor}60` } : undefined}
                      className={t.themed ? "" : "text-gray-300 dark:text-gray-600"}
                    />
                  </span>
                </span>
                {p.image_url && (
                  <>
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className={
                        t.useDynamicImage && !t.isMasonry
                          ? "relative z-10 w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-500"
                          : "relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      }
                      style={{ background: t.themed ? `${t.textColor}08` : "#ffffff" }}
                    />
                    {t.showStockBadge && p.stock != null && p.stock > 0 && p.stock <= 5 && (
                      <span
                        className="absolute z-20 top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
                        style={{ background: t.accentColor, color: readableTextOn(t.accentColor, "#ffffff") }}
                      >
                        Only {p.stock} left
                      </span>
                    )}
                  </>
                )}
                {!p.has_variants && <CardStepper sellerId={sellerId} productId={p.id} name={p.name} />}
              </div>
            );

            const info = (
              <div
                className={`min-w-0 ${t.isList ? "flex-1" : ""}`}
                style={t.textAlign ? { textAlign: t.textAlign } : undefined}
              >
                <div className={t.isList ? "flex items-start justify-between gap-3" : ""}>
                  <h3
                    className={`${t.nameWeight} ${t.nameSize} leading-snug ${t.isList ? "" : "line-clamp-2"} ${
                      t.themed ? "" : "text-gray-900 dark:text-white"
                    }`}
                    style={t.themed ? { color: t.cardText } : undefined}
                  >
                    {p.name}
                  </h3>
                  <p className={`${t.priceClasses} shrink-0 ${t.isList ? "mt-0" : "mt-0.5"}`} style={t.priceStyle}>
                    {minPrice != null && minPrice !== p.price
                      ? `From ₦${minPrice.toLocaleString()}`
                      : `₦${p.price.toLocaleString()}`}
                  </p>
                </div>
                {p.description && (
                  <p
                    className="text-xs mt-1.5 leading-relaxed line-clamp-2"
                    style={{ color: t.themed ? `${t.cardText}70` : undefined }}
                  >
                    {p.description}
                  </p>
                )}
                <ProductRating productId={p.id} />
              </div>
            );

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${p.name}`}
                onClick={() => setQuickViewId(p.id)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setQuickViewId(p.id);
                  }
                }}
                className={`${t.cardClasses} cursor-pointer ${
                  t.isList ? "" : "transition-transform duration-300 hover:-translate-y-0.5"
                } ${t.isMasonry ? "mb-4 break-inside-avoid block w-full" : ""}`}
                style={{
                  ...t.cardBgStyle,
                  ...t.cardInlineStyle,
                  ...(t.isHorizontal
                    ? { minWidth: "240px", flexShrink: 0, scrollSnapAlign: "start" as const }
                    : {}),
                }}
              >
                {t.isList ? (
                  <div className="flex items-center gap-4">
                    {media}
                    {info}
                  </div>
                ) : (
                  <>
                    {media}
                    {info}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ProductQuickView
        product={
          quickViewProduct
            ? {
                id: quickViewProduct.id,
                name: quickViewProduct.name,
                price: quickViewProduct.price,
                image_url: quickViewProduct.image_url,
                description: quickViewProduct.description,
                stock: quickViewProduct.stock,
                has_variants: !!quickViewProduct.has_variants,
              }
            : null
        }
        variants={quickViewProduct ? variantsByProduct[quickViewProduct.id] || [] : []}
        sellerId={sellerId}
        storeUsername={username}
        theme={modalTheme}
        defaultOpen
        onClose={closeQuickView}
      />
    </div>
  );
}
