"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageIcon } from "@/components/Icons";
import { ProductRating } from "./ProductRating";
import { CardStepper } from "@/components/CartButtons";
import ProductQuickView from "@/components/ProductQuickView";

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
  themed: boolean;
  showStockBadge: boolean;
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
}: {
  products: GridProduct[];
  variantsByProduct: Record<string, GridVariant[]>;
  theme: GridTheme;
  modalTheme: ModalTheme;
  sellerId: string;
  username: string;
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

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <h2 className="text-lg font-bold" style={{ color: t.textColor }}>
          Shop all
        </h2>
        <span className="text-sm shrink-0" style={{ color: `${t.textColor}60` }}>
          {products.length} product{products.length === 1 ? "" : "s"}
        </span>
      </div>

      {categories.length >= 2 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-1 px-1">
          {["All", ...categories].map((c) => {
            const active = c === "All" ? activeCat === null : activeCat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c === "All" ? null : c)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all active:scale-95 ${
                  active ? "text-white border-transparent" : ""
                }`}
                style={
                  active
                    ? { background: t.accentColor }
                    : { color: `${t.textColor}80`, borderColor: `${t.textColor}20` }
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: `${t.textColor}60` }}>
          Nothing in this category yet.
        </p>
      ) : (
        <div className={`${t.isHorizontal ? "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" : `grid ${t.gridCols} ${t.gapSize}`}`}>
          {visible.map((p) => {
            const vars = variantsByProduct[p.id] || [];
            const minPrice =
              p.has_variants && vars.length > 0
                ? Math.min(...vars.map((v) => (v.price_override != null ? v.price_override : p.price)))
                : null;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${p.name}`}
                onClick={() => setQuickViewId(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setQuickViewId(p.id);
                  }
                }}
                className={`${t.cardClasses} cursor-pointer`}
                style={{
                  ...t.cardBgStyle,
                  ...t.cardInlineStyle,
                  ...(t.isHorizontal ? { minWidth: "200px", flexShrink: 0, scrollSnapAlign: "start" as const } : {}),
                }}
              >
                {!p.has_variants && (
                  <CardStepper sellerId={sellerId} productId={p.id} name={p.name} />
                )}
                <div
                  className={`${t.useDynamicImage ? "" : t.imageAspect} overflow-hidden ${t.imageRadius} mb-3 flex items-center justify-center ${t.useDynamicImage ? "" : t.imageAspect ? "bg-gray-50 dark:bg-white/[0.04]" : ""}`}
                  style={t.themed ? { background: `${t.textColor}08` } : undefined}
                >
                  {p.image_url ? (
                    <div className="relative w-full">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className={t.useDynamicImage ? "w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300" : "w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"}
                      />
                      {t.showStockBadge && p.stock != null && p.stock > 0 && p.stock <= 5 && (
                        <span
                          className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow"
                          style={{ background: t.accentColor }}
                        >
                          Only {p.stock} left
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className={`w-full ${t.useDynamicImage ? "h-48" : "h-full aspect-square"} flex items-center justify-center bg-gray-50 dark:bg-white/[0.04]`}>
                      <PackageIcon size={40} style={t.themed ? { color: `${t.textColor}25` } : undefined} className={t.themed ? "" : "text-gray-300 dark:text-gray-600"} />
                    </div>
                  )}
                </div>
                <div className={t.isList ? "flex items-center justify-between gap-2" : ""}>
                  <h3
                    className={`${t.nameWeight} ${t.nameSize} truncate min-w-0 ${t.isList ? "flex-1" : ""} ${t.themed ? "" : "text-gray-900 dark:text-white"}`}
                    style={t.themed ? { color: t.cardText } : undefined}
                  >
                    {p.name}
                  </h3>
                  <p className={`${t.priceClasses} shrink-0`} style={t.priceStyle}>
                    {minPrice != null && minPrice !== p.price ? `From ₦${minPrice.toLocaleString()}` : `₦${p.price.toLocaleString()}`}
                  </p>
                  <ProductRating productId={p.id} />
                </div>
                {p.description && (
                  <p
                    className="text-xs mt-1.5 leading-relaxed line-clamp-2"
                    style={{ color: t.themed ? `${t.cardText}70` : undefined }}
                  >
                    {p.description}
                  </p>
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
